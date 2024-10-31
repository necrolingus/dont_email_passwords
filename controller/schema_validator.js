import Ajv from 'ajv'
const ajv = new Ajv()

const store_secret_schema = {
    type: "object",
    properties: {
      secret: {type: "string"},
      expire_hours: {type: "integer"},
      expire_clicks: {type: "integer"}
    },
    required: ["secret", "expire_hours", "expire_clicks"],
    additionalProperties: false
  }

function validate_store_secret (data) {
    const validate = ajv.compile(store_secret_schema)
    const valid = validate(data)
    return valid
}

export {validate_store_secret}
