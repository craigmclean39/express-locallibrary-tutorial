let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

AuthorSchema.virtual('name').get(() => {
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  if (!this.first_name || !this.family_name) {
    fullname = '';
  }

  return fullname;
});

AuthorSchema.virtual('lifespan').get(() => {
  let lifetime_string = '';

  lifetime_string = `${
    this.date_of_birth ?? this.date_of_birth.getYear().toString()
  } - ${this.date_of_death ?? this.date_of_death.getYear().toString()}`;

  return lifetime_string;
});

AuthorSchema.virtual('url').get(() => {
  return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model('Author', AuthorSchema);
