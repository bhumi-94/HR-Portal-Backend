const yup = require("yup");

const signupSchema = yup.object().shape({
 
  // PERSONAL INFORMATION
  

  firstname: yup
    .string()
    .trim()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),

  lastname: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),

  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters"),

  personalEmail: yup
    .string()
    .trim()
    .email("Enter a valid personal email")
    .required("Personal email is required"),

  workingEmail: yup
    .string()
    .trim()
    .email("Enter a valid working email")
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(
      /^[0-9]{10}$/,
      "Phone number must contain exactly 10 digits"
    ),

  address: yup
    .string()
    .trim()
    .required("Address is required")
    .min(5, "Please enter a valid address"),

  gender: yup
    .string()
    .required("Gender is required"),

   
  // WORK INFORMATION
   

  department: yup
    .string()
    .trim()
    .required("Department is required"),

  jobTitle: yup
    .string()
    .trim()
    .required("Job title is required"),

   
  // PASSWORD
   

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf(
      [yup.ref("password")],
      "Passwords must match"
    ),

     // TERMS
   
  terms: yup
    .boolean()
    .oneOf(
      [true],
      "You must accept the Terms and Conditions"
    ),
});

module.exports = signupSchema;
