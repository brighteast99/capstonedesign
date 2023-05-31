import HTTP from "./HTTP";

const API = {
  Test: "test",
  SignIn: "signin_user",
  SignUp: "signup_user",
  CheckExistingID: "is_duplicate_id",
  CheckExistingEmail: "is_duplicate_email",
  SearchUserForMyID: "search_user_for_my_id",
  SearchUserForPW: "search_user_for_password",
  ModifyPassword: "modify_user_password",
  GetUser: "user",
  GetUsers: "users",
  EditUser: "edit_user",
  SearchPosts: "threads",
  GetPost: "thread",
  CreatePost: "create_thread",
  EditPost: "edit_thread",
};
Object.freeze(API);

const constructQueryString = function (name, args, fields) {
  let queryString = name;

  let formattedArgs = [];
  for (const key of Object.keys(args)) {
    //Wrap value with "" if type is string
    switch (typeof args[key]) {
      case "string":
        formattedArgs.push(`${key}:"${args[key]}"`);
        break;
      case "number" || "boolean":
        formattedArgs.push(`${key}:${args[key]}`);
        break;
      case "object":
        if (Array.isArray(args[key]))
          formattedArgs.push(`${key}:"${args[key].join(", ")}"`);
        else
          formattedArgs.push(
            `${key}: ${JSON.stringify(JSON.stringify(args[key]))}`
          );
        break;
      default:
        throw `invalid argument type: ${typeof args[key]} ${key} ${args[key]}`;
    }
  }
  queryString += `(${formattedArgs.join(" ")})`;

  if (fields) {
    let fieldString = "";
    // Case1: fields is a string
    if (typeof fields == "string") fieldString = fields;
    // Case2: fields is array of strings or objects
    else if (Array.isArray(fields)) {
      fields.forEach((element, idx) => {
        // flatten all element whose type is object to string
        if (typeof element == "object") {
          const key = Object.keys(element)[0];

          // flatten the value if the it is an array
          if (Array.isArray(element[key])) {
            fields[idx] = `${key} { ${element[key].join(" ")} }`;
            console.log(fields[idx]);
          } else {
            let flatten = [];
            Object.keys(element).forEach((key) => {
              flatten.push(`${key}:${element[key]}`);
            });
            fields[idx] = flatten.join(" ");
          }
        }
      });
      fieldString = fields.join(" ");
    }
    // Case3: fields is an object
    else {
      const key = Object.keys(fields)[0];

      // flatten the value if the it is an array
      if (Array.isArray(fields[key])) fields[key] = fields[key].join(" ");

      fieldString = `${key} { ${fields[key]} }`;
    }

    if (fieldString.length > 0) queryString += `{${fieldString}}`;
  }

  console.log(queryString);
  return queryString;
};

/**
 *
 * @param {string} name - API 이름
 * @param {Object} args - API와 전달할 인자
 * @param {string | string[]} fields - 반환받을 필드
 *
 * @returns Axios Promise
 */
const apiRequest = function () {
  this.querySet = [];
};

apiRequest.prototype.execute = function (name, args, fields) {
  this.querySet.push(constructQueryString(name, args, fields));
  return this.send();
};

apiRequest.prototype.push = function (name, args, fields) {
  this.querySet.push(constructQueryString(name, args, fields));
  return this;
};

apiRequest.prototype.send = function () {
  let finalQuery = "{";
  for (const query of this.querySet) finalQuery += query + " ";
  finalQuery += "}";

  return HTTP.post("", { query: finalQuery });
};

const parseResponse = (_response) => {
  return new Promise((resolve) => {
    const response = _response.data;
    resolve(response["data"]);
  });
};

export { API, apiRequest, parseResponse };
