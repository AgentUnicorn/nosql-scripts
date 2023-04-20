const fs = require('fs')
const Excel = require('exceljs');

let elements = fs.readFileSync("/Users/macpro/Desktop/Script/ExcelPrinter/2023-03-15/crmInput.json", {encoding:'utf8', flag:'r'});
elements = JSON.parse(elements)

let dataReport = fs.readFileSync("/Users/macpro/Desktop/Script/ExcelPrinter/2023-03-15/dataReport.json", {encoding:'utf8', flag:'r'});
dataReport = JSON.parse(dataReport)

const business_fields = elements.business_fields
const confirm_tags = elements.confirm_tags

const verifiedData = dataReport.find(d => d._id === 'verified').data
const resellData = dataReport.find(d => d._id === 'resell').data

const employee_types = [
    'Dưới 10',
    'Trên 10',
    'Trên 50',
    'Trên 100',
    'Trên 500',
    'Trên 1000'
];

const wb = new Excel.Workbook();

let fileName = '/Users/macpro/Desktop/dataReport.xlsx'

function printDataToWorksheet(worksheet, data, wb) {
    const ws = wb.addWorksheet(worksheet)
    ws.getCell('A1').value = 'CRM'
    ws.getCell('B1').value = 'Nhân viên'
    ws.getCell('C1').value = 'Loại hình kinh doanh'
    ws.getCell('D1').value = 'Lý do'
    ws.getCell('E1').value = 'Số lượng'

    employee_types.forEach(type => {
        dataByType = data.filter(dt => dt.number_employee_type === type)

        dataByType.forEach(item => {
            let crm = worksheet
            let employee_type = type
            let business_field = getBusinessField(item.business_field_id)
            let confirm_tag_name = ''
            let count = 0
        
            item.detail.forEach(confirm_tag => {
                confirm_tag_name = getConfirmTag(confirm_tag.latest_contact_reason_id)
                count = confirm_tag.count
                ws.addRow([crm, employee_type, business_field, confirm_tag_name, count]);
            }) 
        })
    })

}

printDataToWorksheet('Lọc lại', verifiedData , wb)
printDataToWorksheet('Bán lại', resellData, wb)

wb.xlsx.writeFile(fileName);
  
console.log("File is written");

function getBusinessField(id) {
    let business_field = business_fields.find(b => b._id === id)
    if (business_field) {
        return business_field.name
    } else {
        return 'Chưa có ngành hàng'
    }
}

function getConfirmTag(id) {
    let confirm_tag = confirm_tags.find(c => c._id === id)
    if (confirm_tag) {
        return confirm_tag.name
    } else {
        return 'Chưa có lý do hoặc liên hệ'
    }
}