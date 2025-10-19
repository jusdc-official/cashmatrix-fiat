# CASHMATRIX Deployment Guide

## Prerequisites

1. **Vercel Account**: https://vercel.com/signup
2. **Git Repository**: GitHub/GitLab
3. **Environment Variables**: Ready

---

## 🚀 Deploy to Vercel

### Method 1: Vercel CLI (Current)


cd ~/cashmatrix-fiat

Install Vercel CLI
npm install -g vercel

Login
vercel login

Deploy to production
vercel --prod

text

### Method 2: GitHub Integration

1. Push code to GitHub:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/cashmatrix.git
git push -u origin main

text

2. Connect to Vercel:
- Go to https://vercel.com/new
- Import GitHub repository
- Configure project
- Deploy

---

## ⚙️ Environment Setup

### Vercel Dashboard
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add:
VITE_WALLETCONNECT_PROJECT_ID=2eb2bd0a7b3b42b2ab032eec8e938bba
VITE_MASTER_WALLET=0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97

text

---

## 🌐 Custom Domain

### Add Domain to Vercel

1. Go to Project → Domains
2. Add domain: `cashmatrix.io`
3. Configure DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

---

## ✅ Post-Deployment Checklist

- [ ] Test wallet connection
- [ ] Verify Ramp widget opens
- [ ] Test USDC purchase
- [ ] Verify swap functionality
- [ ] Check all 4 networks
- [ ] Test on mobile devices
- [ ] Monitor error logs
- [ ] Set up analytics

---

## 📊 Monitoring

### Vercel Analytics
- Visit: Project → Analytics
- Track: Page views, visitors, performance

### Error Tracking
- Check: Project → Runtime Logs
- Monitor: API errors, build failures

---

## 🔄 Updates

### Deploy Updates

Make changes
git add .
git commit -m "Update feature"
git push

Or via CLI
vercel --prod

text

### Rollback

List deployments
vercel ls

Promote previous deployment
vercel promote [deployment-url]

text

---

**Current Production URL**: https://cashmatrixx.vercel.app
