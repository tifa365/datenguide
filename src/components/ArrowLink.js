import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  link: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    color: theme.palette.grey[0],
    textDecoration: 'none',
  },
  text: {
    marginTop: '1px',
  },
  icon: {
    marginRight: theme.spacing(1),
    marginTop: '3px',
  },
}))

const ArrowLink = ({ href, children }) => {
  const classes = useStyles()
  return (
    <a className={classes.link} href={href}>
      <ArrowForwardIcon className={classes.icon} color="secondary" />
      <span className={classes.text}>{children}</span>
    </a>
  )
}

export default ArrowLink
