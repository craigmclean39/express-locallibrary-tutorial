let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

AuthorSchema.virtual('name').get(function () {
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  if (!this.first_name || !this.family_name) {
    fullname = '';
  }
  return fullname;
});

AuthorSchema.virtual('lifespan').get(function () {
  let lifetime_string = '';

  if (this.date_of_birth || this.date_of_death) {
    lifetime_string = `(${
      this.date_of_birth ? this.date_of_birth.getFullYear().toString() : ''
    } - ${
      this.date_of_death ? this.date_of_death.getFullYear().toString() : ''
    })`;
  }

  return lifetime_string;
});

AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model('Author', AuthorSchema);
