<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('sendmail_from', 'ariel@arielbalter.com');

// Hardcoded test data
// $_POST['name'] = 'Test Name';
// $_POST['email'] = 'ariel@arielbalter.com';
// $_POST['message'] = 'This is a test message.';

// Ensure that the data is present before sending email
if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['message'])) {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);
    
    $to = 'ariel@arielbalter.com';
    $subject = 'New Contact Form Submission';
    $body = "Name: $name\nEmail: $email\nMessage: $message";
    $headers = "From: no-reply@ngx365.inmotionhosting.com\r\n";
    $headers .= "Reply-To: ariel@arielbalter.com\r\n";


    if (mail($to, $subject, $body, $headers)) {
        echo 'Message sent!';
    } else {
        echo 'Failed to send message.';
        error_log("Mail failed: " . print_r(error_get_last(), true)); // Log detailed error
        print_r(error_get_last()); // Print the error to the screen
    }

} else {
    echo 'No data to send.';
}
