const fs = require('fs')
const Excel = require('exceljs');
const { report } = require('process');

const wb = new Excel.Workbook();
const ws = wb.addWorksheet('My Sheet')

ws.getCell('A1').value = 'Nhân viên'
ws.getCell('B1').value = 'Khách hàng'
ws.getCell('C1').value = 'Lịch Demo'
ws.getCell('D1').value = 'Note'

async function printDataToTable() {
    let reportData = fs.readFileSync("./reportData.json", {encoding:'utf8', flag:'r'});
    reportData = JSON.parse(reportData)

    let usersData = fs.readFileSync("./usersData.json", {encoding:'utf8', flag:'r'});
    usersData = JSON.parse(usersData)

    let fileName = 'DemoSchedule.xlsx';
    reportData.forEach(data => {
        let username = usersData.find(u => u._id === data._id)?.name

        data.data.forEach(demo => {
            let shop_name = demo.shop_name
            demo.note.forEach(note => {
                ws.addRow([username, shop_name, note.date_done, note.note]);
            })
        })

        ws.addRow()
    })

    await wb.xlsx.writeFile(fileName);
  
    console.log("File is written");
    // wb.xlsx
    //     .writeFile(fileName)
    //     .then(() => {
    //         console.log('file created');
    //     })
    //     .catch(err => {
    //         console.log(err.message);
    //     });
}

printDataToTable()