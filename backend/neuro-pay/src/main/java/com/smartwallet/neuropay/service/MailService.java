package com.smartwallet.neuropay.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;


@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendWelcomeEmail(String toEmail, String fullName, String virtualCardNumber) {
        try {
            Context context = new Context();
            context.setVariable("name", fullName);
            context.setVariable("virtualCardNumber", virtualCardNumber);
            context.setVariable("email", toEmail);

            String htmlContent = templateEngine.process("welcome-email", context);
            sendHtmlEmail(toEmail, "Welcome to NeuroPay 🎉", htmlContent);

            log.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendAlertEmail(String toEmail, String fullName, String title, String description) {
        try {
            Context context = new Context();
            context.setVariable("name", fullName);
            context.setVariable("title", title);
            context.setVariable("description", description);

            String htmlContent = templateEngine.process("alert-email", context);
            sendHtmlEmail(toEmail, "NeuroPay Alert: " + title, htmlContent);

            log.info("Alert email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send alert email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        try {
            Context context = new Context();
            context.setVariable("name", fullName);
            context.setVariable("resetLink", resetLink);

            String htmlContent = templateEngine.process("reset-password-email", context);
            sendHtmlEmail(toEmail, "Reset Your NeuroPay Password", htmlContent);

            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(new InternetAddress(fromEmail, "NeuroPay"));
        } catch (java.io.UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}