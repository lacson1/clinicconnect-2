#!/bin/bash

# Add commonly used medications to the pharmacy inventory
# This script adds essential medications frequently prescribed in Nigerian healthcare

echo "Adding commonly used medications to pharmacy inventory..."

# Common Pain and Fever Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Paracetamol 500mg Tablets",
    "description": "Analgesic and antipyretic for pain and fever relief",
    "quantity": 500,
    "unit": "tablets",
    "lowStockThreshold": 50,
    "supplier": "GlaxoSmithKline Nigeria",
    "expiryDate": "2026-12-31"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Ibuprofen 400mg Tablets",
    "description": "NSAID for pain, inflammation and fever",
    "quantity": 300,
    "unit": "tablets",
    "lowStockThreshold": 30,
    "supplier": "Emzor Pharmaceutical",
    "expiryDate": "2026-08-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Aspirin 75mg Tablets",
    "description": "Low-dose aspirin for cardiovascular protection",
    "quantity": 400,
    "unit": "tablets",
    "lowStockThreshold": 40,
    "supplier": "Fidson Healthcare",
    "expiryDate": "2027-03-20"
  }'

# Common Antibiotics
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Amoxicillin 500mg Capsules",
    "description": "Broad-spectrum penicillin antibiotic",
    "quantity": 200,
    "unit": "capsules",
    "lowStockThreshold": 25,
    "supplier": "GlaxoSmithKline Nigeria",
    "expiryDate": "2025-11-30"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Ciprofloxacin 500mg Tablets",
    "description": "Fluoroquinolone antibiotic for bacterial infections",
    "quantity": 150,
    "unit": "tablets",
    "lowStockThreshold": 20,
    "supplier": "Emzor Pharmaceutical",
    "expiryDate": "2025-09-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Metronidazole 400mg Tablets",
    "description": "Antibiotic for anaerobic bacterial and protozoal infections",
    "quantity": 180,
    "unit": "tablets",
    "lowStockThreshold": 25,
    "supplier": "Fidson Healthcare",
    "expiryDate": "2026-01-10"
  }'

# Antimalarials
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Artemether-Lumefantrine Tablets",
    "description": "First-line antimalarial treatment (Coartem)",
    "quantity": 100,
    "unit": "blister packs",
    "lowStockThreshold": 15,
    "supplier": "Novartis Nigeria",
    "expiryDate": "2025-12-31"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Artesunate Injection 60mg",
    "description": "Injectable antimalarial for severe malaria",
    "quantity": 50,
    "unit": "vials",
    "lowStockThreshold": 10,
    "supplier": "Guilin Pharmaceutical",
    "expiryDate": "2025-08-20"
  }'

# Hypertension Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Amlodipine 5mg Tablets",
    "description": "Calcium channel blocker for hypertension",
    "quantity": 250,
    "unit": "tablets",
    "lowStockThreshold": 30,
    "supplier": "Pfizer Nigeria",
    "expiryDate": "2026-06-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Lisinopril 10mg Tablets",
    "description": "ACE inhibitor for hypertension and heart failure",
    "quantity": 200,
    "unit": "tablets",
    "lowStockThreshold": 25,
    "supplier": "Emzor Pharmaceutical",
    "expiryDate": "2026-04-30"
  }'

# Diabetes Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Metformin 850mg Tablets",
    "description": "Biguanide for type 2 diabetes management",
    "quantity": 300,
    "unit": "tablets",
    "lowStockThreshold": 40,
    "supplier": "Fidson Healthcare",
    "expiryDate": "2026-10-25"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Glibenclamide 5mg Tablets",
    "description": "Sulfonylurea for type 2 diabetes",
    "quantity": 180,
    "unit": "tablets",
    "lowStockThreshold": 25,
    "supplier": "May & Baker Nigeria",
    "expiryDate": "2026-07-10"
  }'

# Respiratory Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Salbutamol Inhaler 100mcg",
    "description": "Bronchodilator for asthma and COPD",
    "quantity": 75,
    "unit": "inhalers",
    "lowStockThreshold": 10,
    "supplier": "GlaxoSmithKline Nigeria",
    "expiryDate": "2026-05-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Prednisolone 5mg Tablets",
    "description": "Corticosteroid for inflammation and allergic reactions",
    "quantity": 200,
    "unit": "tablets",
    "lowStockThreshold": 30,
    "supplier": "Emzor Pharmaceutical",
    "expiryDate": "2026-02-28"
  }'

# Gastrointestinal Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Omeprazole 20mg Capsules",
    "description": "Proton pump inhibitor for acid-related disorders",
    "quantity": 150,
    "unit": "capsules",
    "lowStockThreshold": 20,
    "supplier": "AstraZeneca Nigeria",
    "expiryDate": "2026-09-30"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Loperamide 2mg Capsules",
    "description": "Anti-diarrheal medication",
    "quantity": 100,
    "unit": "capsules",
    "lowStockThreshold": 15,
    "supplier": "Janssen Nigeria",
    "expiryDate": "2026-11-20"
  }'

# Vitamins and Supplements
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Vitamin B Complex Tablets",
    "description": "Essential B vitamins supplement",
    "quantity": 400,
    "unit": "tablets",
    "lowStockThreshold": 50,
    "supplier": "Fidson Healthcare",
    "expiryDate": "2027-01-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Folic Acid 5mg Tablets",
    "description": "Folate supplement for anemia prevention",
    "quantity": 250,
    "unit": "tablets",
    "lowStockThreshold": 30,
    "supplier": "Emzor Pharmaceutical",
    "expiryDate": "2027-04-10"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Iron Sulphate 200mg Tablets",
    "description": "Iron supplement for iron deficiency anemia",
    "quantity": 200,
    "unit": "tablets",
    "lowStockThreshold": 25,
    "supplier": "May & Baker Nigeria",
    "expiryDate": "2026-12-05"
  }'

# Oral Rehydration and Electrolytes
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "ORS Sachets",
    "description": "Oral rehydration salts for diarrhea and dehydration",
    "quantity": 500,
    "unit": "sachets",
    "lowStockThreshold": 100,
    "supplier": "WHO/UNICEF",
    "expiryDate": "2027-06-30"
  }'

# Contraceptives
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Levonorgestrel Emergency Contraceptive",
    "description": "Morning-after pill for emergency contraception",
    "quantity": 50,
    "unit": "tablets",
    "lowStockThreshold": 10,
    "supplier": "Bayer Nigeria",
    "expiryDate": "2026-08-25"
  }'

# Antihistamines
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Loratadine 10mg Tablets",
    "description": "Non-sedating antihistamine for allergies",
    "quantity": 180,
    "unit": "tablets",
    "lowStockThreshold": 25,
    "supplier": "Schering-Plough Nigeria",
    "expiryDate": "2026-07-15"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Chlorpheniramine 4mg Tablets",
    "description": "Sedating antihistamine for allergic reactions",
    "quantity": 200,
    "unit": "tablets",
    "lowStockThreshold": 30,
    "supplier": "Emzor Pharmaceutical",
    "expiryDate": "2026-05-20"
  }'

# Topical Medications
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Hydrocortisone Cream 1%",
    "description": "Topical corticosteroid for skin inflammation",
    "quantity": 80,
    "unit": "tubes",
    "lowStockThreshold": 15,
    "supplier": "Taro Pharmaceutical",
    "expiryDate": "2025-12-10"
  }'

curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Clotrimazole Cream 1%",
    "description": "Antifungal cream for skin infections",
    "quantity": 60,
    "unit": "tubes",
    "lowStockThreshold": 12,
    "supplier": "Bayer Nigeria",
    "expiryDate": "2026-03-15"
  }'

# Antacids
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Magnesium Trisilicate Tablets",
    "description": "Antacid for stomach acid neutralization",
    "quantity": 300,
    "unit": "tablets",
    "lowStockThreshold": 40,
    "supplier": "Fidson Healthcare",
    "expiryDate": "2026-11-30"
  }'

# Eye Drops
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Chloramphenicol Eye Drops 0.5%",
    "description": "Antibiotic eye drops for bacterial conjunctivitis",
    "quantity": 40,
    "unit": "bottles",
    "lowStockThreshold": 8,
    "supplier": "Allergan Nigeria",
    "expiryDate": "2025-10-15"
  }'

# Cough and Cold
curl -X POST http://localhost:5000/api/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "name": "Dextromethorphan Cough Syrup",
    "description": "Cough suppressant for dry cough",
    "quantity": 50,
    "unit": "bottles",
    "lowStockThreshold": 10,
    "supplier": "Pfizer Nigeria",
    "expiryDate": "2025-12-20"
  }'

echo "Successfully added commonly used medications to pharmacy inventory!"