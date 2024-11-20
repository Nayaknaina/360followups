// let loadBox = document.querySelector('#loadBox')
// let otpForm = document.querySelector('#otpFillFormBox')
// let submitBtn = document.querySelector('#signupSubmitBtn')
// let emailVerifyBtn = document.querySelector('#emailVerifyBtn')
// let emailInp = document.querySelector('#emailInp')
// function verifyBtnDisplay() {
//   document.querySelector("#emailVerifyBtn").style.display = "initial";
// }

// async function verifyEmail() {
//   const emailInput = document.getElementById("emailInp");
//   const email = emailInput.value.trim();

//   // Client-side validation
//   if (!validateEmail(email)) {
//     let textContent = "Please enter a valid email address.";
//     toastr.error(textContent);
//     return;
//   }

//   try {
//     // Send request to the server for email verification
//     loadBox.style.display = "block";
//     const response = await axios.post("/api/verify", { email });

//     if (response) {
//       let textContent = response.data.msg;
//       toastr.success(textContent);
//       otpForm.style.display = "block";
//     } else {
//       let textContent = response.data.msg;
//       toastr.error(textContent);
//       loadBox.style.display = "none";
//     }
//   } catch (error) {
//     console.error("Error verifying email:", error);
//     let textContent =
//       "An error occurred while verifying the email. Please try again later.";
//     toastr.error(textContent);
//     loadBox.style.display = "none";
//   }
// }

// async function submitSignupForm() {
//   const form = document.querySelector("#signUpForm");
//   const name = document.querySelector("#signUpForm #signName").value;
//   const emailInp = document.querySelector("#signUpForm #emailInp").value;
//   const pass = document.querySelector("#signUpForm #psw").value;
//   const conPass = document.querySelector("#signUpForm #signConPassword").value;
//   const agentCode = document.querySelector("#signUpForm #agentCode").value;
//   const mobile = document.querySelector("#signUpForm #mobile_code").value;
//   const email = emailInp.trim();

//   const countryData = $("#mobile_code").intlTelInput("getSelectedCountryData");
//   const countryCode = countryData.dialCode; // Extracting the dial code

//   let formData = {
//     name,
//     email,
//     password: pass,
//     confirmPassword: conPass,
//     agentCode,
//     mobile,
//     countryCode,
//   };
//   console.log(formData);
//   try {
//     let res = await axios.post("/user/signup", formData);
//     if (res.status === 200) {
//       form.reset();
//       toastr.success(res.data.msg);
//       setTimeout(() => {
//         window.location.href = "/user/dashboard";
//       }, 3000);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// }

// // send req to server for otp verfication
// async function matchVerifyOtp() {
//   const inputs = document.querySelectorAll(".otp-input");

//   let otp = "";
//   inputs.forEach((input) => {
//     otp += input.value;
//   });
//   if (otp.length !== 6) {
//     toastr.error("invailid otp");
//     return;
//   }
//   loadBox.style.zIndex = "999999";
//   try {
//     let res = await axios.post("/api/otp/verify", { reqOtp: otp });
//     console.log(res);

//     if (res.status === 200) {
//       let textContent = res.data.msg;
//       toastr.success(textContent);
//       loadBox.style.display = "none";
//       otpForm.style.display = "none";
//       emailVerifyBtn.style.display = "none";
//       submitBtn.style.cursor = "pointer";
//       submitBtn.style.backgroundColor = "#5995fd";
//       submitBtn.disabled = false;
//       console.log(emailInp.value);
//       emailInp.disabled = true;
//     }
//   } catch (error) {
//     if (error.response && error.response.status === 403) {
//       let textContent = error.response.data.msg;
//       toastr.error(textContent);
//       console.log("loadbox hata do");
//       loadBox.style.display = "none";
//       otpForm.style.display = "none";
//     } else if (error.response && error.response.status === 400) {
//       let textContent = error.response.data.msg;
//       toastr.error(textContent || "Invalid OTP!");
//       loadBox.style.display = "none";
//       otpForm.style.display = "block"; // You can decide whether to show the form again
//     } else {
//       toastr.error("Ooops!, Something went wrong!");
//       loadBox.style.display = "none";
//       otpForm.style.display = "none";
//     }
//   }
// }
// // Email validation function
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic regex for email validation
  return re.test(String(email).toLowerCase());
}

// todo ajax post on here
$(document).ready(function () {
  $("#super-admin-registration-form").submit(function (e) {
    e.preventDefault(); // Prevent the form from submitting normally
    const countryData = $("#mobile").intlTelInput(
      "getSelectedCountryData"
    );
    let phone = $("#mobile").val(); 
    const mobile = `${countryData.dialCode}${phone}`;
    // Collect the form data

    var formData = {
      name: $("#name").val(),
      email: $("#email").val(),
      mobileNumber: mobile,
      password: $("#password").val(),
      confirmPassword: $("#cpass").val(),
    };
    console.log(formData)
    addLoader('loader')
    // Send the data using AJAX
    $.ajax({
      url: "/wsv/super/signup", // Replace with your server endpoint
      type: "POST",
      data: formData, // Send form data
      success: function (response) {
        // Handle success response
        removeLoader('loader') 
        console.log("Form submitted successfully:", response);
        window.location.href = "/wsv/super/dashboard";
      },
      error: function (xhr, status, error) {
        // Handle error response
        removeLoader('loader') 
        console.log("Form submission error:", error);
      },
    });
  });
});

//todo email verify
$(document).ready(function () {
  $("#closeOTPbox").click(function () {
    $("#otpFillFormBox").css("display", "none");
  });

  // Attach click event to the button
  $("#verify-email-button").click(function () {
    const email = $("#email").val();

    if (!validateEmail(email)) {
      let textContent = "Please enter a valid email address.";
      toastr.error(textContent);
      return;
    }

    let formData = {
      email,
    };
    let registerBtn = $("#register-btn");
    addLoader("loader");
    // Send the form data using AJAX
    $.ajax({
      url: "/wsv/super/api/verify", // Replace with your server endpoint
      type: "POST",
      data: formData, // Send form data
      success: function (response) {
        console.log("Email verification successfully:", response);

        removeLoader("loader");
        toastr.success(response.msg);

        $("#otpFillFormBox").css("display", "block");
      },
      error: function (xhr, status, error) {
        console.log("Form submission error:", error);
        toastr.error(xhr.responseJSON.msg);
        removeLoader('loader')
      },
    });
  });
});

$(document).ready(function () {
  $("#SubmitOTPbtn").click(function () {
    const inputs = $(".otp-input");

    let otp = "";
    inputs.each(function () {
      otp += $(this).val(); // Use $(this) to access the current input's value
    });
    if (otp.length !== 6) {
      toastr.error("invailid otp");
      return;
    }
    let formData = {reqOtp:otp};
    addLoader("loader");
    // Send the form data using AJAX
      $.ajax({
        url: '/wsv/super/api/otp/verify',  // Replace with your server endpoint
        type: 'POST',
        data: formData,  // Send form data
        success: function(response) {
          console.log('Email verification successfully:', response);

          removeLoader('loader')
          toastr.success(response.msg);
          
          $('#otpFillFormBox').css('display', 'none');
          $('#verify-email-button').css('display', 'none');
          $('#register-btn').prop('disabled', false);
          
        },
        error: function(xhr, status, error) {
            console.log('Form submission error:', error);
            removeLoader('loader')
            toastr.error(xhr.responseJSON.msg);
        }
      });
  });
});
