const fs = require('fs')
const Excel = require('exceljs');

const wb = new Excel.Workbook();

let elements = fs.readFileSync("/Users/macpro/Desktop/Script/ExcelPrinter/2023-04-06/crmInput.json", {encoding:'utf8', flag:'r'});
elements = JSON.parse(elements)

const business_fields = elements.business_fields
const confirm_tags = elements.confirm_tags

let fileName = '/Users/macpro/Desktop/Script/ExcelPrinter/2023-04-06/dataUpdate.xlsx'
const Workbook = wb.xlsx.readFile(fileName).then(wb => {
    let total_sheet = 2
    for (let i = 0; i <= total_sheet; i++) {
        let worksheet = wb.worksheets[i]
        let sheetName = worksheet.name
        let updateBusinessFields = {}
        let updateConfirmTags = {}
    
        worksheet.eachRow(row => {
            let shopId = row.getCell('A').value
            
            if (shopId) {
                let business_field = row.getCell('F').value
                let reason = row.getCell('G').value
        
                if (business_field) {
                    // console.log(business_field)
                    getDataWithExcelValue(business_field, business_fields, updateBusinessFields, shopId)
                }
        
                if (reason) {
                    // console.log(reason)
                    getDataWithExcelValue(reason, confirm_tags, updateConfirmTags, shopId)
                }
            }
        })

        const dataUpdateInfo = {
            business_fields: updateBusinessFields,
            comfirm_tags: updateConfirmTags
        };
        fs.writeFileSync(`/Users/macpro/Desktop/${sheetName}.json`, JSON.stringify(dataUpdateInfo));
        console.log(`Success writing to file ${sheetName}.json`)
    }
})


function getDataWithExcelValue(value, dataArrayObj, updateBusinessFields, shopId)
{
    let dataFounded = dataArrayObj.find(data => data.name === value)
    if (dataFounded) {
        updateBusinessFields[shopId] = dataFounded._id
    }
}