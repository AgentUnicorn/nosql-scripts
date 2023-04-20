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
input

const dataReport = db.shops.aggregate([
    {
        $match: {
            $or: orQuery
        }
    },
    {
        $match: {
            deleted_at: null
        }  
    },
    {
        $addFields: {
            business_field: {$toString: {$first: '$business_field_ids'}},
            number_employee_type: {
                $switch: {
                    branches: [
                        {
                            case: {$gt: ['$number_employee', 1000]},
                            then: "Trên 1000"
                        },   
                        {
                            case: {$and: [
                                {$gt: ['$number_employee', 500]},
                                {$lte: ['$number_employee', 1000]}
                            ]},
                            then: "Trên 500"
                        },
                        {
                            case: {$and: [
                                {$gt: ['$number_employee', 100]},
                                {$lte: ['$number_employee', 500]}
                            ]},
                            then: "Trên 100"
                        },
                        {
                            case: {$and: [
                                {$gt: ['$number_employee', 50]},
                                {$lte: ['$number_employee', 100]}
                            ]},
                            then: "Trên 50"
                        },
                        {
                            case: {$and: [
                                {$gte: ['$number_employee', 10]},
                                {$lte: ['$number_employee', 50]}
                            ]},
                            then: "Trên 10"
                        },
                    ],
                    default: 'Dưới 10'
                }
            }
        }  
    }, 
    {
        $group: {
            _id: {
                sale_kanban_id: {$toString: '$sale_kanban_id'},
                business_field_id: '$business_field',
                latest_contact_reason_id: {$toString: '$latest_contact_reason_id'},
                number_employee_type: '$number_employee_type',
            },
            count: {
                $sum: 1
            }
        }
    },
    {
        $group: {
            _id: {
                number_employee_type: '$_id.number_employee_type',
                business_field_id: '$_id.business_field_id',
                sale_kanban: {
                    $function: {
                        body: function(kanban_id, input) {
                            let MarketObj = input.find(item => item.kanban_ids.includes(kanban_id))
    
                            if (MarketObj) {
                                return MarketObj.type
                            }
                        },
                        args: ['$_id.sale_kanban_id', input],
                        lang: 'js'
                    }
                }
            },
            detail: {
                $push: {
                    latest_contact_reason_id: '$_id.latest_contact_reason_id',
                    count: '$count'
                }
            }
        }
    },
    {
        $sort: {
          '_id.business_field_id': 1,
          '_id.number_employee_type': 1
        }
    },
    {
        $group: {
            _id: '$_id.sale_kanban',
            data: {
                $push: {
                    number_employee_type: '$_id.number_employee_type',
                    business_field_id: '$_id.business_field_id',
                    detail: '$detail'
                }
            }
        }
    },
]).toArray()

fs.writeFileSync("/Users/Macpro/Desktop/dataReport.json", JSON.stringify(dataReport));








