const fs = require('fs')

// Sale kanban ID: 5e37aab66b53000055003e28 (Fail)
// Sale kanban ID: 5f68754893609c0f2b07e145 (Lọc lại)
// Sale kanban ID: 5f5f19ea1b6f3b0af3e7ff37 (Nuôi dưỡng) / 180 days
// Sale kanban ID: 5eddc61a4ce622445bc5fa16 (Cơ hội) / 90 days
// Sale kanban ID: 630ee5e8554e4b28717a6195 (Fail tiềm năng)
// Sale kanban ID: 5e78d1028bee912390752b9b (Freemium)

function AddOrSubractDays(startingDate, number, add) {
  if (add) {
    return new Date(new Date().setDate(startingDate.getDate() + number));
  } else {
    return new Date(new Date().setDate(startingDate.getDate() - number));
  }
}

const input = [
    {
        type: 'verified',
        kanban_ids: ['5e37aab66b53000055003e28', '5f68754893609c0f2b07e145'],
        criteria: [
            {sale_kanban_id: ObjectId('5e37aab66b53000055003e28')},
            {sale_kanban_id: ObjectId('5f68754893609c0f2b07e145')},    
        ]
    },
    {
        type: 'resell',
        kanban_ids: ['630ee5e8554e4b28717a6195', '5e78d1028bee912390752b9b', '5f5f19ea1b6f3b0af3e7ff37', '5eddc61a4ce622445bc5fa16'],
        criteria: [
            {sale_kanban_id: ObjectId('630ee5e8554e4b28717a6195')},
            {sale_kanban_id: ObjectId('5e78d1028bee912390752b9b')},
            {$and: [
                {sale_kanban_id: ObjectId('5f5f19ea1b6f3b0af3e7ff37')},
                {kanban_updated_at: {$lt: AddOrSubractDays(new Date(), 180, false)}}
            ]},
            {$and: [
                {sale_kanban_id: ObjectId('5eddc61a4ce622445bc5fa16')},
                {kanban_updated_at: {$lt: AddOrSubractDays(new Date(), 90, false)}}
            ]},
        ]
    }
]

let matchStage = input.map(item => {
    return item.criteria
})

let orQuery = matchStage.reduce((a, b) => a.concat(b), []);
input.map(function(item) { 
    delete item.criteria; 
    return item; 
});

let khac_business_field_id = '63db2f01f9edc77d561d17ac'
// input

const dataReport = db.shops.aggregate([
    {
        $match: {
            $or: orQuery
        }
    },
    {
        $match: {
            deleted_at: null,
        }  
    },
    {
        $addFields: {
            sale_kanban_id_string: {$toString: '$sale_kanban_id'}
        }  
    },
    {
        $facet: {
            "shopHasUndefineBusiness": [
                {$match: {
                    business_field_ids: ObjectId(khac_business_field_id),
                    latest_contact_reason_id: {$exists: true}
                }},
                {
                    $group: {
                        _id: {
                            sale_kanban_id: {
                                $function: {
                                    body: function(kanban_id, input) {
                                        let MarketObj = input.find(item => item.kanban_ids.includes(kanban_id))
                
                                        if (MarketObj) {
                                            return MarketObj.type
                                        }
                                    },
                                    args: ['$sale_kanban_id_string', input],
                                    lang: 'js'
                                }
                            },
                        },
                        data: {
                            $push: {
                                id: {$toString: '$_id'},
                                name: '$name'
                            }
                        }
                    }
                },
            ],
            "shopDontHaveLastContact": [
                {$match: {
                    business_field_ids: {$ne: ObjectId(khac_business_field_id)},
                    $or: [
                        {latest_contact_reason_id: null},
                        {latest_contact_reason_id: {$exists: false}}
                    ]
                }},
                {
                    $group: {
                        _id: {
                            sale_kanban_id: {
                                $function: {
                                    body: function(kanban_id, input) {
                                        let MarketObj = input.find(item => item.kanban_ids.includes(kanban_id))
                
                                        if (MarketObj) {
                                            return MarketObj.type
                                        }
                                    },
                                    args: ['$sale_kanban_id_string', input],
                                    lang: 'js'
                                }
                            },
                        },
                        data: {
                            $push: {
                                id: {$toString: '$_id'},
                                name: '$name'
                            }
                        }
                    }
                },
            ],
            "shopHasUndefineBusinessAndDontHaveLastContact": [
                {$match: {
                    business_field_ids: ObjectId(khac_business_field_id),
                    $or: [
                        {latest_contact_reason_id: null},
                        {latest_contact_reason_id: {$exists: false}}
                    ]
                }},
                {
                    $group: {
                        _id: {
                            sale_kanban_id: {
                                $function: {
                                    body: function(kanban_id, input) {
                                        let MarketObj = input.find(item => item.kanban_ids.includes(kanban_id))
                
                                        if (MarketObj) {
                                            return MarketObj.type
                                        }
                                    },
                                    args: ['$sale_kanban_id_string', input],
                                    lang: 'js'
                                }
                            },
                        },
                        data: {
                            $push: {
                                id: {$toString: '$_id'},
                                name: '$name'
                            }
                        }
                    }
                },
            ]
        }  
    },
    
]).toArray()

fs.writeFileSync("/Users/Macpro/Desktop/dataReport.json", JSON.stringify(dataReport));