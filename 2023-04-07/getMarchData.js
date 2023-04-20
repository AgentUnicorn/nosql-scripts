const fs = require('fs')
const Excel = require('exceljs');
const { type } = require('os');

let marchData = fs.readFileSync(`/Users/macpro/Desktop/Script/ExcelPrinter/2023-04-07/marchData.json`, {encoding:'utf8', flag:'r'});

marchData = JSON.parse(marchData)

const priority_keys = [
    '_id',
    'name',
    'alias',
    'username',
    'lang',
    'phone',
    'username_register',
    'email',
    'prefix',
    'active_user',
    'business_field_ids',
    'addresss',
    'latitude',
    'longtitude',
    'start_trial_date',
    'updated_at',
    'created_at',
    'device'
];
let shop_keys = marchData.shop_keys
let shop_data = marchData.shop_data

shop_keys = shop_keys.filter(item => !priority_keys.includes(item)).sort();
const sortedShopKeys = [...priority_keys, ...shop_keys]
console.log(sortedShopKeys)

const wb = new Excel.Workbook();

let fileName = '/Users/macpro/Desktop/marchData.xlsx'

const ws = wb.addWorksheet('Test Data')

const firstRowValue = []
sortedShopKeys.forEach((keys, index) => {
    // ws.getCell(`A${index+1}`).v
    firstRowValue[index+1] = keys
})
ws.addRow(firstRowValue)

shop_data.forEach(shop => {
    let keys = Object.keys(shop)
    const shopRowValues = []
    sortedShopKeys.forEach((field, index) => {
        if (keys.includes(field)) {

            if (Array.isArray(shop[field])) {
                let value = shop[field].join(', ')
            }
            else {
                value = shop[field]
            }

            shopRowValues[index+1] = value
        }
    })
    // console.log(shopRowValues);
    ws.addRow(shopRowValues)
})

wb.xlsx.writeFile(fileName);

