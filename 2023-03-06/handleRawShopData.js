const fs = require('fs')
const Excel = require('exceljs');

const wb = new Excel.Workbook();
const ws = wb.addWorksheet('My Sheet')

ws.getCell('A1').value = 'Khách hàng'
ws.getCell('B1').value = 'Số điện thoại'
ws.getCell('C1').value = 'Email'
ws.getCell('D1').value = 'Ngành hàng'

async function printDataToTable() {
    let reportData = fs.readFileSync("./rawShopByPhone.json", {encoding:'utf8', flag:'r'});
    reportData = JSON.parse(reportData)

    let fileName = 'rawShop.xlsx';
    reportData.forEach(data => {
        let business_fields = data.company_fields.map((company_field => {
            return company_field.name
        })).join(', ')
        ws.addRow([data.name, data.phone, data.email ?? '', business_fields]);
    })

    await wb.xlsx.writeFile(fileName);
  
    console.log("File is written");
}

printDataToTable()