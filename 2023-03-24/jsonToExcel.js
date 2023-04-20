const fs = require('fs')
const Excel = require('exceljs');

let report = fs.readFileSync("/Users/macpro/Desktop/Script/ExcelPrinter/2023-03-24/dataReport.json", {encoding:'utf8', flag:'r'});
report = JSON.parse(report)[0]

let crmInput = fs.readFileSync("/Users/macpro/Desktop/Script/ExcelPrinter/2023-03-24/crmInput.json", {encoding: 'utf8', flag: 'r'})
crmInput = JSON.parse(crmInput)

const shopHasUndefineBusiness = report.shopHasUndefineBusiness
const shopDontHaveLastContact = report.shopDontHaveLastContact
const shopHasUndefineBusinessAndDontHaveLastContact = report.shopHasUndefineBusinessAndDontHaveLastContact

const business_field = crmInput.business_fields
const confirm_tag = crmInput.confirm_tags

const wb = new Excel.Workbook();

let fileName = '/Users/macpro/Desktop/dataReport.xlsx'

function printDataToWorksheet(worksheet, data, wb, business_field, confirm_tag)
{
    const ws = wb.addWorksheet(worksheet)
    ws.getCell('A1').value = 'id'
    ws.getCell('B1').value = 'Cột'
    ws.getCell('C1').value = 'Khách hàng'
    ws.getCell('D1').value = 'Số điện thoại'
    ws.getCell('E1').value = 'Nhân viên'
    ws.getCell('F1').value = 'Ngành hàng (Lựa theo mẫu)'

    data.forEach(marketCollumn => {
        let type = (marketCollumn._id.sale_kanban_id == 'resell') ? 'Bán lại' : 'Lọc lại'
        // console.log(`${type}: ${marketCollumn.data.length}`)
        marketCollumn.data.forEach(item => { 
            ws.addRow([item.id, type, item.name, item.phone, item.saler]);
        })
    })

    printExampleData(business_field, 'Ngành hàng (Mẫu)', 'M', ws);
    printExampleData(confirm_tag, 'Lý do (Mẫu)', 'N', ws);
}

function printExampleData(data, name, collumn, ws)
{
    ws.getCell(`${collumn}1`).value = name
    data.forEach((dataObj, index) =>  {
        ws.getCell(`${collumn}${index+2}`).value = dataObj.name
    })
}

printDataToWorksheet('Khách hàng chưa có ngành hàng', shopHasUndefineBusiness , wb, business_field, confirm_tag)
printDataToWorksheet('Khách hàng chưa có liên hệ cuối', shopDontHaveLastContact , wb, business_field, confirm_tag)
printDataToWorksheet('Khách hàng chưa có cả 2', shopHasUndefineBusinessAndDontHaveLastContact , wb, business_field, confirm_tag)

wb.xlsx.writeFile(fileName);
  
console.log("File is written");

