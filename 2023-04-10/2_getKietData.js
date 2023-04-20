// Bình em xuất ds khách hàng của Kiệt gồm, tên, sdt, ngành, lý do ra excel cho chị nha
// bs thêm nguồn, và hiện ở cột nào trên CRM

const fs = require('fs')

let input = fs.readFileSync("/Users/Macpro/Desktop/crmInput.json", {encoding:'utf8', flag:'r'});
input = JSON.parse(input)
// Kiệt
let user_id = '627875127b494GLpg'

let business_fields = input.find(item => item._id === 'business_field')
let confirm_tags = input.find(item => item._id === 'confirm_tag')
let sale_kanbans = input.find(item => item._id === 'sale_kanban')

let dataToFile = 'Khách hàng > Số điện thoại > Ngành > Lý do > Nguồn > Số lượng NV > Kanban\n'
db.shops.aggregate([
    {
        $match: {
            'sale_kanban_user_ids.sale': user_id
        }
    },
    {
        $unwind: '$sale_kanban_user_ids.sale'
    },
    {
        $match: {
            'sale_kanban_user_ids.sale': user_id
        }
    },
    {
        $addFields: {
            business_fields: {
                $map: {
                    input: '$business_field_ids',
                    as: 'id',
                    in: {
                        $function: {
                            body: function(id, business_fields) {
                                let business_field = business_fields.data.find(bf => bf.id === id)
                                if (business_field) {
                                    return business_field.name
                                }
                            },
                            args: [{$toString: '$$id'}, business_fields],
                            lang: 'js'
                        }
                    }
                }
            }
        }
    },
    {
        $sort: {
            sale_kanban_id: 1,
            business_field_ids: 1,
            latest_contact_reason_id: 1
        }  
    },
    {
        $project: {
            name: 1,
            phone: 1,
            business_fields: {
                $reduce: {
                    input: '$business_fields',
                    initialValue: '',
                    in: {
                        $concat: [
                            '$$value',
                            {
                                '$cond': [
                                    {$eq: ['$$value', '']}, '', ', '
                                ]
                            },
                            '$$this'
                        ]
                    }
                }
            },
            latest_contact_reason: {
                $function: {
                    body: function(id, confirm_tags) {
                        let confirm_tag = confirm_tags.data.find(bf => bf.id === id)
                        if ( confirm_tag) {
                            return confirm_tag.name
                        }
                    },
                    args: [{$toString: '$latest_contact_reason_id'}, confirm_tags],
                    lang: 'js'
                }
            },
            utm_source: 1,
            number_employee: 1,
            sale_kanban: {
                $function: {
                    body: function(id, sale_kanbans) {
                        let sale_kanban = sale_kanbans.data.find(bf => bf.id === id)
                        if ( sale_kanban) {
                            return sale_kanban.name
                        }
                    },
                    args: [{$toString: '$sale_kanban_id'}, sale_kanbans],
                    lang: 'js'
                }
            } 
        }
    }
]).forEach(it => {
    let str = `${it.name} > ${it.phone} > ${it.business_fields} > ${it.latest_contact_reason ?? ''} > ${it.utm_source ?? ''} > ${it.number_employee ?? 0} > ${it.sale_kanban}\n`
    dataToFile += str
})

fs.writeFile('/Users/Macpro/Desktop/KietData.txt', dataToFile, (err) => {
    // In case of a error throw err.
    if (err) throw err;
    console.log('Success!!')
})