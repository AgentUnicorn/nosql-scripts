const fs = require('fs')

let input = fs.readFileSync("/Users/Macpro/Desktop/crmTaskReportInput.json", {encoding:'utf8', flag:'r'});
input = JSON.parse(input)

let user_ids = input.map(item => item._id)
let shop_ids = []
input.forEach(item => {
    item.shop_ids.forEach(id => {
        shop_ids.push(ObjectId(id))
    })
})

let dataToFile = 'Nhân viên > Tổng Lead > Tổng Task > Chưa tạo task > Trễ Task \n'
db.crm_label_activities.aggregate([
    {
        $match: {
            object_id: {
                $in: shop_ids
            },
            assigner_ids: {
                $in: user_ids  
            },
            code: 'contact',
            deleted_at: null
        }
    },
    {
        $unwind: '$assigner_ids'
    },
    {
        $match: {
            assigner_ids: {
                $in: user_ids
            }   
        }
    },
    {
        $group: {
            _id: '$assigner_ids',
            total_task: {$sum: 1},
            late_task: {
                $sum: {
                    $cond: [
                    {
                        $and: [
                            {$ne: ['$is_done', 1]},
                            {$lte: ['$date', new Date()]}
                        ]
                    },
                    1,
                    0
                ]
                }
            },
            shop_ids: {
                $addToSet: {
                    $toString: '$object_id'
                }
            }
        }
    },
    {
        $addFields: {
            name: {
                $function: {
                    body: function(user_id, data) {
                        let user = data.find(u => u._id === user_id)
                        if (user) {
                            return user.name
                        }
                    },
                    args: ['$_id', input],
                    lang: "js"
                }  
            },
            total_lead: {
                $function: {
                    body: function(user_id, data) {
                        let userReport = data.find(u => u._id === user_id)
                        
                        let total = 0
                        if (userReport) {
                            return userReport.count
                        }
                        return total
                    },
                    args: ['$_id', input],
                    lang: "js"
                }
            },
            empty_task: {
                $function: {
                    body: function(checkArr, user_id, inputArr) {
                        let userReport = checkArr.find(u => u._id === user_id)
                        
                        let total = 0
                        if (userReport) {
                            total = userReport.shop_ids.filter(shop_id => !inputArr.includes(shop_id)).length
                        }
                        return total
                    },
                    args: [input, '$_id', '$shop_ids'],
                    lang: 'js'
                }               
            },
        }
    }
]).forEach(it=>{
    let str = `${it.name} > ${it.total_lead} > ${it.total_task} > ${it.empty_task} > ${it.late_task} \n`
    dataToFile += str
})

fs.writeFile('/Users/Macpro/Desktop/Output.txt', dataToFile, (err) => {
    // In case of a error throw err.
    if (err) throw err;
})