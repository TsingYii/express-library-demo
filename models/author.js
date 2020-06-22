const mongoose = require('mongoose');
var moment = require('moment');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date},
    }
);

// 虚拟属性'name'：表示作者全名
AuthorSchema
    .virtual('name')
    .get(function () {
        return this.family_name + ', ' + this.first_name;
    });


// 虚拟属性'url'：作者 URL
AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

AuthorSchema
    .virtual('date_of_birth_formatted')
    .get(function () {
        return this.date_of_birth?moment(this.date_of_birth).format('MMMM Do, YYYY'):"";
    });

AuthorSchema
    .virtual('date_of_death_formatted')
    .get(function () {
        return this.date_of_death? moment(this.date_of_death).format('MMMM Do, YYYY'):"";
    });

// 虚拟属性'lifespan'：作者寿命
AuthorSchema
    .virtual('lifespan')
    .get(function () {
        const death = this.date_of_death?this.date_of_death:new Date()
        const birth = this.date_of_birth?this.date_of_birth:new Date()
        if(!this.date_of_birth){
            return "生卒年份不详"
        }
        return (death.getYear() - this.date_of_birth.getYear()).toString();
    });


// 导出 Author 模型
module.exports = mongoose.model('Author', AuthorSchema);
