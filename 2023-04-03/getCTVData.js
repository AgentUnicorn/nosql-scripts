const fs = require('fs')

let business_field_ids = []
let business_fields = []

db.elements.find({
    type: 'business_field',
    name: {
        $in: [
            'Phân phối',
            'Bán lẻ',
            /IT/
        ]
    }
})
.project({
    id: {$toString: '$_id'},
    name: '$name'
})
.forEach(it => {
    business_field_ids.push(ObjectId(it.id))
    business_fields.push(it)
})

// business_fields

// let data = []

let data = db.raw_shops.aggregate(
    {
        $match: {
            company_field_ids: {
                $in: business_field_ids
            },
            moved: null
        }
    },
    {
        $sort: {
            business_field_id: -1
        }  
    },
    {
        $group: {
            _id: {
                $toString: {
                    $first: '$company_field_ids'
                }
            },
            data: {
                $push: '$$ROOT'
            }
        }
    },
    {
        $sort: {
            _id: -1
        }
    },
    {
        $addFields: {
            business_field: 
                {$function: {
                body: function(id, data) {
                    let business_field = data.find(d => d.id === id)
                    if (business_field) {
                        return business_field.name
                    }
                },
                args: ['$_id', business_fields],
                lang: 'js'
            }}
        }
    }
).toArray()

fs.writeFileSync("/Users/Macpro/Desktop/dataForCTV.json", JSON.stringify(data));