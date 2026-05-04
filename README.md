# AI-Powered Centralized Subscription Management System for Banking Platforms

[![Java Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/AI/ML-Python%20%7C%20TensorFlow-yellow)](https://www.tensorflow.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20MongoDB-orange)](https://www.postgresql.org/)

Modern banking platforms process recurring payments but lack intelligent systems for subscription management. This project introduces an AI-powered solution to automatically detect subscription transactions, monitor billing patterns, detect fraud, and give users full control over recurring payments.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Executive Summary](#executive-summary)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Tech Stack & Tools](#tech-stack--tools)
- [Competitor Analysis](#competitor-analysis)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Future Enhancements](#future-enhancements)
- [Developer](#developer)
- [References](#references)

---

## Problem Statement

Many modern banking platforms primarily focus on processing financial transactions but lack intelligent systems for effective subscription management. As a result, customers face:

- Limited visibility of active subscriptions
- Difficulty identifying recurring charges
- Inability to detect abnormal billing patterns
- Unauthorized subscription renewals going unnoticed
- Missing alerts for sudden price increases

Existing fraud detection systems focus on unusual transaction locations or spending spikes, but recurring payment anomalies remain undetected.

**Solution:** Automatically identify subscription transactions, monitor billing patterns, detect anomalies, and provide users with full control and transparency over recurring payments.

---

## Executive Summary

With the rapid growth of subscription-based digital services (Netflix, Spotify, Amazon, cloud services, etc.), recurring payments have increased significantly. However, most banking apps only provide basic transaction histories — no intelligent tools for identifying, monitoring, or managing subscriptions.

**What I built:**

- AI-powered automatic detection of recurring payments
- Centralized dashboard to view and manage all subscriptions
- Fraud alerts for sudden price increases or suspicious recurring charges
- User controls to approve, pause, or block subscriptions directly
- Real-time notifications via app, email, or SMS

**Impact:** Increases financial transparency, reduces wasted spending, improves fraud detection for recurring transactions, and brings AI-driven intelligence into digital banking.

---

## System Architecture

**Frontend:** React dashboard for user interaction

**Backend:** Java Spring Boot services handling transaction ingestion, subscription management, and notifications

**Database:** PostgreSQL or MongoDB for storing transactions and subscriptions

**AI Microservice:** Python-based ML engine for detecting subscriptions and anomalies

**Notification Service:** Sends alerts to users via app/email/SMS

**Data Flow:** Frontend ↔ Backend ↔ Database | Backend ↔ AI Microservice | AI Microservice ↔ Notification Service

---

## Key Features

**1. Subscription Dashboard**

Centralized overview of all recurring payments. Displays all detected subscriptions in a single dashboard. Shows merchant name, subscription amount, billing cycle, next payment date, and subscription status. Allows users to view payment history of each subscription.

**2. AI Subscription Detection**

Automatically identifies recurring patterns. Analyzes transaction data to detect recurring payments. Identifies patterns such as monthly or yearly billing cycles. Automatically categorizes recurring transactions as subscriptions. Updates detected subscriptions in the user dashboard.

**3. Fraud Alerts**

Detects sudden price increases or suspicious charges. Monitors subscription payments for unusual activity. Detects unexpected price changes or irregular billing amounts. Flags suspicious transactions for user verification. Sends alerts when abnormal subscription behavior is detected.

**4. Inactive Subscription Monitoring**

Flags subscriptions with no usage for a defined period. Tracks subscriptions that remain active without usage. Identifies potentially unnecessary recurring payments. Notifies users about inactive subscriptions. Suggests pausing or canceling unused services.

**5. User Controls**

Approve, pause, or block subscriptions directly from the dashboard. Allows users to approve or reject subscription transactions. Provides options to pause recurring payments temporarily. Enables users to block specific merchants or subscriptions. Updates subscription status in the backend system.

**6. Notifications**

Real-time alerts via app, email, or SMS. Sends alerts when a new subscription is detected. Notifies users before upcoming subscription charges. Provides warnings for suspicious or abnormal payments. Supports multiple notification channels.

---

## Tech Stack & Tools

**Backend:** Java Spring Boot, REST APIs

**Frontend:** React / Web App

**Database:** PostgreSQL / MongoDB

**AI/ML:** Python, Scikit-learn, TensorFlow

**Methodology:** Data collection & preprocessing → Backend development for transaction management → AI model for subscription detection and anomaly prediction → Frontend dashboard implementation → Integration and testing

---

## Competitor Analysis

**PayPal**
- Tracks transactions and payments
- Does not provide AI-based subscription detection or predictive analysis

**Rocket Money**
- Helps users track and cancel subscriptions
- Operates as third-party application, depends on linking bank accounts, lacks deep AI-based fraud detection

**Bank Mobile Applications**
- Mostly provide transaction history and basic notifications
- Limited subscription management features

**My System**
- Integrates AI-driven subscription detection directly into banking infrastructure
- Enables centralized subscription monitoring, fraud detection for recurring payments, and real-time alerts

---

## Project Structure
