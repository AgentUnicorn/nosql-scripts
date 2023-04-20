const fs = require('fs')
const Excel = require('exceljs');

let data = fs.readFileSync("/Users/macpro/Desktop/Script/ExcelPrinter/2023-04-03/dataForCTV2.json", {encoding:'utf8', flag:'r'});
data = JSON.parse(data)[0]

const report = data.report
const total = data.total
const total_source = data.total_by_source

const wb = new Excel.Workbook();

let fileName = '/Users/macpro/Desktop/dataTho2.xlsx'

const ws = wb.addWorksheet('Data')
ws.getCell('A1').value = 'id'
ws.getCell('B1').value = 'STT'
ws.getCell('C1').value = 'Khách hàng'
ws.getCell('D1').value = 'Tỉnh thànhh'
ws.getCell('E1').value = 'Ngành hàng'
ws.getCell('F1').value = 'Số điện thoại'
ws.getCell('G1').value = 'Nguồn'
ws.getCell('H1').value = 'Link'
ws.getCell('I1').value = 'Số lượng NV'

ws.getCell('M1').value = 'Ngành hàng'
ws.getCell('N1').value = 'Tổng'

ws.getCell('P1').value = 'Nguồn'
ws.getCell('Q1').value = 'Tổng'

let count = 1
report.forEach((dataGroup, index) => {
    let row = index+2
    let id = dataGroup._id

    let company_fields = id.company_fields
    let total = dataGroup.count

    dataGroup.data.forEach(item => { 
        if (validatePhone(item.phone)) {
            ws.addRow([
                item._id.valueOf()['$oid'],
                count,
                item.name,
                item.province ?? '',
                company_fields,
                item.phone, 
                item.source,
                item.link,
                employeeNumber(item.size_from, item.size_to)
            ]);
            count++
        }
    })

    // ws.getCell(`M${row}`).value = company_fields
    // ws.getCell(`N${row}`).value = total
})

// total_source.forEach((source, index) => {
//     let row = index+2
//     ws.getCell(`P${row}`).value = source._id
//     ws.getCell(`Q${row}`).value = source.total
// })
wb.xlsx.writeFile(fileName);

function validatePhone(phone)
{
    let pattern = new RegExp('^09[0-9]{8}$', 'i')
    return pattern.test(phone)
}

function employeeNumber(from, to)
{
    if (from && to) {
        if (from === '-') {
            return `${to}${from}`
        } 
        else if (to === '+') {
            return `${from}${to}`
        } 
        else {
            return `${from} - ${to}`
        }

    } 

    return ''
}
  
console.log(`File is written. Total ${count} record(s)`);

