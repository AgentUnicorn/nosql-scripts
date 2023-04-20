const fs = require('fs')

let business_field = {}

db.elements.find({
    type: 'business_field'
})
.project({
    id: {$toString: '$_id'},
    name: 1
})
.forEach(it => {
    business_field[it.id] = it.name
})

// business_field

let data = db.raw_shops_b.aggregate(
    {
        $facet: {
            "total_by_source": [
                {
                    $match: {
                        moved: null,
                        source: {
                            $in: ['topcv', "vietnamworks", "glints"]
                        }
                    }
                },
                {
                    $group: {
                        _id: '$source',
                        total : {
                            $sum: 1
                        }
                    }
                }
            ],
            "report": [
                {
                    $match: {
                        moved: null,
                        source: {
                            $in: ['topcv', "vietnamworks", "glints"]
                        }
                    }
                },
                {
                    $addFields: {
                        'total_company_fields': {
                            $size: '$company_field_ids'
                        },
                        'company_fields': {
                            $map: {
                                input: '$company_field_ids',
                                as: 'id',
                                in: {
                                    $toString: '$$id'
                                }
                            }
                        }
                    }
                },
                {
                    $sort: {
                        total_company_fields: 1,
                        company_fields: 1
                    }  
                },
                {
                    $group: {
                        _id: {
                            company_field_ids: '$company_fields',
                            company_fields: {
                                $function: {
                                    body: function(ids, data){
                                        let company_names = ids.map(id => {
                                            return data[id]
                                        })
                                        
                                        return company_names.join(', ')
                                    },
                                    args: [ '$company_fields', business_field],
                                    lang: 'js'
                                }  
                            },
                            total_field: '$total_company_fields'  
                        },
                        data: {
                            $push: '$$ROOT'
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.total_field': 1
                    }
                },
            ],
            "total": [
                {
                    $match: {
                        moved: null,
                        source: {
                            $in: ['topcv', "vietnamworks", "glints"]
                        }
                    }
                },
                {
                    $addFields: {
                        'total_company_fields': {
                            $size: '$company_field_ids'
                        },
                        'company_fields': {
                            $map: {
                                input: '$company_field_ids',
                                as: 'id',
                                in: {
                                    $toString: '$$id'
                                }
                            }
                        }
                    }
                },
                {
                    $sort: {
                        total_company_fields: 1,
                        company_fields: 1
                    }  
                },
                {
                    $group: {
                        _id: {
                            company_field_ids: '$company_fields',
                            company_fields: {
                                $function: {
                                    body: function(ids, data){
                                        let company_names = ids.map(id => {
                                            return data[id]
                                        })
                                        
                                        return company_names.join(', ')
                                    },
                                    args: [ '$company_fields', business_field],
                                    lang: 'js'
                                }  
                            },
                            total_field: '$total_company_fields'  
                        },
                        data: {
                            $push: '$$ROOT'
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$count'
                        }
                    }
                }    
            ]
        }
    },
    
).toArray()

data
// fs.writeFileSync("/Users/Macpro/Desktop/dataForCTV2.json", JSON.stringify(data));