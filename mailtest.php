<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('sendmail_from', 'ariel@arielbalter.com');

if (mail('ariel@arielbalter.com', 'Test Email', 'This is a test email from PHP')) {
    echo 'Email sent successfully!';
} else {
    echo 'Email failed to send.';
}
?>
