const fs = require('fs')
const Excel = require('exceljs');

const wb = new Excel.Workbook();
const ws = wb.addWorksheet('My Sheet')

ws.getCell('A1').value = 'Khách hàng'
ws.getCell('B1').value = 'Số điện thoại'

async function printDataToTable() {
    let reportData = fs.readFileSync("./rawShopByPhone.json", {encoding:'utf8', flag:'r'});
    reportData = JSON.parse(reportData)

    let fileName = 'resellShop.xlsx';
    reportData.forEach(data => {
        ws.addRow([data.name, data.phone]);
    })

    await wb.xlsx.writeFile(fileName);
  
    console.log("File is written");
}

printDataToTable()