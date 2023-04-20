const fs = require('fs')

let data = {}
data['business_fields'] = db.elements.find({type: 'business_field'})
  .projection({
      _id: {$toString: '$_id'},
      name: 1
  }).toArray()
   
data['confirm_tags'] = db.elements.find({type: 'confirm_tag'})
    .projection({
      _id: {$toString: '$_id'},
      name: 1
  }).toArray()
console.log(data)

fs.writeFileSync("/Users/Macpro/Desktop/crmInput.json", JSON.stringify(data));
