import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ClientContext } from 'graphql-hooks'
import Highlight from 'react-highlight'

import { makeStyles } from '@material-ui/core/styles'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  Typography,
  LinearProgress,
  Tabs,
  Tab,
  Button,
} from '@material-ui/core'
import CallMadeIcon from '@material-ui/icons/CallMade'
import Alert from '@material-ui/lab/Alert'
import AlertTitle from '@material-ui/lab/AlertTitle'

import getQuery from '../../lib/queryBuilder'
import DataTableToolbar from './DataTableToolbar'
import DataTablePagination from './DataTablePagination'

// TODO create i8n label
const ERROR_MESSAGE = 'Die Daten konnten nicht geladen werden.'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  paper: {
    width: '100%',
    overflowX: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingIndicator: {
    height: '16px',
  },
  tableSection: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  table: {
    flexGrow: 1,
  },
  tableWrapper: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'flex-end',
  },
  error: {
    flex: '1 0 auto',
    padding: theme.spacing(4, 2, 6, 2),
  },
  tableBody: {
    flexGrow: '1 0 auto',
  },
  tableTitle: {
    fontWeight: 'bold',
  },
  heading: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  apiTab: {
    fontSize: theme.typography.body1.fontSize,
    margin: theme.spacing(3),
    marginLeft: theme.spacing(2),
  },
  exportButton: {
    marginTop: '0.3rem',
    height: '3rem',
  },
  alert: {
    margin: '0px 20px',
  },
}))

const DataTable = ({
  regions,
  measures,
  labels,
  layout,
  dispatch,
  actions,
  queryArgs,
}) => {
  const classes = useStyles()
  const client = useContext(ClientContext)

  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [graphqlQuery, setGraphqlQuery] = useState(null)

  const [rowsPerPage, setRowsPerPage] = useState(100)
  const [page, setPage] = useState(0)

  const handleChangePage = (event, page) => {
    setPage(page)
  }
  const handleChangeRowsPerPage = (value) => {
    setRowsPerPage(value.target.value)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // TODO support more than 1 measure
      const measure = Object.values(measures)[0]
      const query = getQuery(
        regions,
        measure,
        labels,
        layout,
        page,
        rowsPerPage
      )
      setGraphqlQuery(query)
      const response = await client.request({ query })
      const { data, error } = response
      if (error) {
        const fetchError = error.fetchError && error.fetchError.statusText
        const httpError = error.httpError && error.httpError.statusText
        const graphQLError =
          error.graphQLErrors &&
          error.graphQLErrors.map((e) => e.message).join('\n')
        setData([])
        setError([fetchError, httpError, graphQLError].join(' ').trim())
      } else if (data && data.table) {
        setData(data.table)
        setError(null)
      } else {
        setError(ERROR_MESSAGE)
      }
      setLoading(false)
    }

    if (Object.keys(measures).length > 0 && regions.length > 0) {
      fetchData()
    } else {
      setData([])
    }
  }, [regions, measures, rowsPerPage, page])

  const columnDefs =
    (data.schema &&
      data.schema.fields
        .filter((f) => f.name !== 'index')
        .map((f) => ({ headerName: f.name, field: f.name }))) ||
    []

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const rows = (data && data.data) || []
  const count = (data && data.pagination && data.pagination.total) || 0

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={1}>
        <>
          <Tabs
            value={tabValue}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleTabChange}
          >
            <Tab label="Tabelle" />
            <Tab label="API" />
          </Tabs>
          <DataTableToolbar
            measures={measures}
            regions={regions}
            labels={labels}
            layout={layout}
            dispatch={dispatch}
            actions={actions}
            queryArgs={queryArgs}
          />
        </>
        {tabValue === 0 && (
          <>
            <div className={classes.loadingIndicator}>
              {loading && <LinearProgress variant="query" />}
            </div>
            <div className={classes.tableSection}>
              {error && (
                <div className={classes.error}>
                  <Alert className={classes.alert} severity="error">
                    <AlertTitle>{ERROR_MESSAGE}</AlertTitle>
                    {error}
                  </Alert>
                </div>
              )}
              <div className={classes.tableWrapper}>
                <Table className={classes.table} size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columnDefs.map((def) => (
                        <TableCell
                          className={classes.tableTitle}
                          key={def.headerName}
                        >
                          {def.headerName}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody className={classes.tableBody}>
                    {!error &&
                      rows.map((row, index) => {
                        return (
                          <TableRow key={index}>
                            {columnDefs.map((def) => (
                              <TableCell key={def.field}>
                                {row[def.field]}
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <DataTablePagination
                        rowsPerPage={rowsPerPage}
                        page={page}
                        count={count}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </>
        )}
        {tabValue === 1 && measures && (
          <div className={classes.apiTab}>
            <Typography variant="h5">
              GraphQL Abfrage zu aktueller Statistik:
            </Typography>
            <Highlight className="graphql">{graphqlQuery}</Highlight>
            <Button
              color="secondary"
              className={classes.exportButton}
              target="_blank"
              href={`http://api.datengui.de/graphql?query=${encodeURI(
                graphqlQuery
              )}`}
              startIcon={<CallMadeIcon />}
            >
              GraphQL Playground öffnen
            </Button>
          </div>
        )}
      </Paper>
    </div>
  )
}

DataTable.propTypes = {
  regions: PropTypes.arrayOf(PropTypes.object),
  measures: PropTypes.arrayOf(PropTypes.object),
  labels: PropTypes.string.isRequired,
}

export default DataTable