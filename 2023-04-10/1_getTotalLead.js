const fs = require('fs')

let user_ids = []
let userObj = []
db.user_organizations.find({
    $or: [
        {crm_role: 'sale'},
        {crm_extra_roles: 'sale'},   
    ],
    is_quit: {
        '$ne': -1
    }
})
.project({
    _id: 1,
    name: 1                                                                      
})
.sort({created_at: -1})
.forEach(user => {
    user_ids.push(user._id)
    userObj.push(user)
})
// user_ids
userObj
let data = db.shops.aggregate([
    {
        $unwind: '$sale_kanban_user_ids.sale'  
    },
    {
        $match: {
            'sale_kanban_user_ids.sale': {
                $in: user_ids
            },
            deleted_at: null
        }  
    },
    {
        $group: {
            _id: '$sale_kanban_user_ids.sale',
            count: {$sum: 1},
            shop_ids: {
                $addToSet: {
                    $toString: '$_id'
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
                    args: ['$_id', userObj],
                    lang: "js"
                }
            }
        }
    }
]).toArray()

// data
fs.writeFileSync("/Users/Macpro/Desktop/crmTaskReportInput.json", JSON.stringify(data));