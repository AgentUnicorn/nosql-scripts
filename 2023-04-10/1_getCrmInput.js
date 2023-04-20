const fs = require('fs')
let crmInput = db.elements.aggregate([
    {
        $match: {
            type: {
                $in: ['business_field', 'confirm_tag']
            }
        }
    },
    {
        $group: {
            _id: '$type',
            data: {
                $push: {
                    id: {$toString: '$_id'},
                    name: '$name'
                }
            }
        }
    }
]).toArray()

let crmKanban = db.crm_kanbans.find().project({
    id: {$toString: '$_id'},
    name: '$name',
    _id: 0
}).toArray();

crmInput.push({
    _id: 'sale_kanban',
    data: crmKanban
})

// crmInput
fs.writeFileSync("/Users/Macpro/Desktop/crmInput.json", JSON.stringify(crmInput));