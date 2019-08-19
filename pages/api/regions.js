const data = require('../../data/ags.json')
const slugify = require('@sindresorhus/slugify');

const districts = Object.keys(data)
    .filter(id => id.length === 5)
    .map(id => ({ 
        name: data[id], 
        id,
        slug: slugify(data[id]) 
    }))

export default (req, res) => {    
    res.status(200).json(districts)
}