#!/bin/bash

# Add pediatric and maternal health medications
echo "Adding pediatric and maternal health medications..."

# Pediatric Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Paracetamol Syrup 120mg/5ml",
    "description": "Pediatric analgesic and antipyretic syrup",
    "quantity": 100,
    "unit": "bottles",
    "lowStockThreshold": 15,
    "supplier": "GlaxoSmithKline Nigeria",
    "expiryDate": "2026-09-30"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Amoxicillin Syrup 125mg/5ml",
    "description": "Pediatric antibiotic suspension",
    "quantity": 80,
    "unit": "bottles",
    "lowStockThreshold": 12,
    "supplier": "GlaxoSmithKline Nigeria",
    "expiryDate": "2025-12-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Zinc Sulphate 20mg Tablets",
    "description": "Zinc supplement for diarrhea treatment in children",
    "quantity": 200,
    "unit": "tablets",
    "lowStockThreshold": 30,
    "supplier": "UNICEF Nigeria",
    "expiryDate": "2027-05-20"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Vitamin A 200,000 IU Capsules",
    "description": "High-dose vitamin A for children",
    "quantity": 100,
    "unit": "capsules",
    "lowStockThreshold": 20,
    "supplier": "UNICEF Nigeria",
    "expiryDate": "2026-11-30"
  }'

# Maternal Health Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Ferrous Sulphate + Folic Acid Tablets",
    "description": "Iron and folate supplement for pregnant women",
    "quantity": 300,
    "unit": "tablets",
    "lowStockThreshold": 50,
    "supplier": "Fidson Healthcare",
    "expiryDate": "2026-08-25"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Methyldopa 250mg Tablets",
    "description": "Antihypertensive safe for pregnancy",
    "quantity": 150,
    "unit": "tablets",
    "lowStockThreshold": 20,
    "supplier": "Emzor Pharmaceutical",
    "expiryDate": "2026-06-10"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Oxytocin Injection 10 IU/ml",
    "description": "Uterotonic for labor induction and postpartum hemorrhage",
    "quantity": 50,
    "unit": "ampoules",
    "lowStockThreshold": 10,
    "supplier": "Pfizer Nigeria",
    "expiryDate": "2025-10-31"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Magnesium Sulphate Injection 50%",
    "description": "Treatment for severe pre-eclampsia and eclampsia",
    "quantity": 30,
    "unit": "ampoules",
    "lowStockThreshold": 8,
    "supplier": "Hospira Nigeria",
    "expiryDate": "2025-12-20"
  }'

# Vaccines and Immunizations
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Tetanus Toxoid Vaccine",
    "description": "Tetanus prevention vaccine",
    "quantity": 40,
    "unit": "vials",
    "lowStockThreshold": 8,
    "supplier": "Serum Institute Nigeria",
    "expiryDate": "2025-08-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Hepatitis B Vaccine",
    "description": "Hepatitis B prevention vaccine",
    "quantity": 35,
    "unit": "vials",
    "lowStockThreshold": 7,
    "supplier": "GSK Nigeria",
    "expiryDate": "2025-09-30"
  }'

# Emergency Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Adrenaline Injection 1:1000",
    "description": "Emergency treatment for anaphylaxis",
    "quantity": 20,
    "unit": "ampoules",
    "lowStockThreshold": 5,
    "supplier": "Pfizer Nigeria",
    "expiryDate": "2025-11-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Diazepam Injection 10mg/2ml",
    "description": "Emergency treatment for seizures",
    "quantity": 25,
    "unit": "ampoules",
    "lowStockThreshold": 6,
    "supplier": "Roche Nigeria",
    "expiryDate": "2026-01-20"
  }'

# Contraceptives
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Combined Oral Contraceptive Pills",
    "description": "Ethinyl estradiol + levonorgestrel",
    "quantity": 120,
    "unit": "cycles",
    "lowStockThreshold": 20,
    "supplier": "Bayer Nigeria",
    "expiryDate": "2026-07-30"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Depo-Provera Injection 150mg",
    "description": "Long-acting contraceptive injection",
    "quantity": 40,
    "unit": "vials",
    "lowStockThreshold": 8,
    "supplier": "Pfizer Nigeria",
    "expiryDate": "2026-03-25"
  }'

# Antifungals
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Fluconazole 150mg Capsules",
    "description": "Antifungal for vaginal candidiasis",
    "quantity": 100,
    "unit": "capsules",
    "lowStockThreshold": 15,
    "supplier": "Pfizer Nigeria",
    "expiryDate": "2026-05-10"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Nystatin Pessaries",
    "description": "Antifungal vaginal suppositories",
    "quantity": 80,
    "unit": "pessaries",
    "lowStockThreshold": 12,
    "supplier": "Bristol-Myers Nigeria",
    "expiryDate": "2025-12-05"
  }'

# Additional Common Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Albendazole 400mg Tablets",
    "description": "Anthelmintic for worm infections",
    "quantity": 200,
    "unit": "tablets",
    "lowStockThreshold": 30,
    "supplier": "GSK Nigeria",
    "expiryDate": "2026-09-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Mebendazole 100mg Tablets",
    "description": "Anthelmintic for intestinal worms",
    "quantity": 250,
    "unit": "tablets",
    "lowStockThreshold": 35,
    "supplier": "Janssen Nigeria",
    "expiryDate": "2026-11-20"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Tramadol 50mg Capsules",
    "description": "Opioid analgesic for moderate to severe pain",
    "quantity": 100,
    "unit": "capsules",
    "lowStockThreshold": 15,
    "supplier": "Pfizer Nigeria",
    "expiryDate": "2025-10-25"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Gentamicin Eye/Ear Drops",
    "description": "Antibiotic drops for eye and ear infections",
    "quantity": 50,
    "unit": "bottles",
    "lowStockThreshold": 10,
    "supplier": "Allergan Nigeria",
    "expiryDate": "2025-08-30"
  }'

echo "Successfully added pediatric and maternal health medications!"