const fs = require('fs')

let fileNames = [
    'shopHasUndefineBusiness',
    'shopDontHaveBoth',
    'shopDontHaveLastContact'    
]

let total_records = 0
fileNames.forEach(name => {
    let start = Date.now()
    
    let dataUpdate = fs.readFileSync(`/Users/macpro/Desktop/${name}.json`, {encoding:'utf8', flag:'r'});
    dataUpdate = JSON.parse(dataUpdate)

    const business_fields = dataUpdate.business_fields
    const confirm_tags = dataUpdate.comfirm_tags

    let total = 0
    if (Object.keys(business_fields).length > 0) {
        let shopIds = Object.keys(business_fields)
        let shopObjIds = shopIds.map(id => ObjectId(id))
        
        db.shops.updateMany(
            {
                _id: {
                    $in: shopObjIds
                }
            },
            [
                {
                    $unset: "business_field_ids"
                },
                {
                    $set: {
                        temp: {
                            $toString: '$_id'
                        }
                    }  
                },
                {
                    $set: {
                        business_field_ids: {
                            $function: {
                                body: function(shop_id, data) {
                                    return [ObjectId(data[shop_id])]
                                },
                                args: ['$temp', business_fields],
                                lang: 'js'
                            }
                        }
                    }   
                },
                {
                    $unset: 'temp'
                }
            ]
        )
        
        total += Object.keys(business_fields).length
    }
    
    if (Object.keys(confirm_tags).length > 0) {
        let shopIds = Object.keys(confirm_tags)
        let shopObjIds = shopIds.map(id => ObjectId(id))
        
        
        db.shops.updateMany(
            {
                _id: {
                    $in: shopObjIds
                }
            },
            [
                {
                    $set: {
                        temp: {
                            $toString: '$_id'
                        }
                    }  
                },
                {
                    $set: {
                        latest_contact_reason_id: {
                            $function: {
                                body: function(shop_id, data) {
                                    return ObjectId(data[shop_id])
                                },
                                args: ['$temp', confirm_tags],
                                lang: 'js'
                            }
                        }
                    }   
                },
                {
                    $unset: 'temp'
                }
            ]
        )
        
        total += Object.keys(confirm_tags).length
    }
    
    let end = Date.now() - start
    console.log(`Updated total ${total} of ${name} file in ${end} miliseconds`)
    
    total_records += total
})

console.log(`Update total ${total_records} record(s)`)