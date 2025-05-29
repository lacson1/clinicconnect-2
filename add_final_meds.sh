#!/bin/bash

BASE_URL="http://localhost:5000/api/medicines"

# Emergency and critical care medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Adrenaline 1mg/ml","description":"Emergency epinephrine injection","quantity":20,"unit":"ampoules","lowStockThreshold":6,"supplier":"Pfizer Nigeria","expiryDate":"2026-08-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Atropine 1mg/ml","description":"Anticholinergic for bradycardia","quantity":25,"unit":"ampoules","lowStockThreshold":8,"supplier":"Hospira Nigeria","expiryDate":"2026-12-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Dopamine 200mg","description":"Inotropic agent for shock","quantity":15,"unit":"vials","lowStockThreshold":5,"supplier":"Abbott Nigeria","expiryDate":"2026-11-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Noradrenaline 4mg","description":"Vasopressor for hypotension","quantity":12,"unit":"ampoules","lowStockThreshold":4,"supplier":"Hospira Nigeria","expiryDate":"2026-10-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Naloxone 0.4mg","description":"Opioid antagonist for overdose","quantity":30,"unit":"ampoules","lowStockThreshold":10,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-18"}'

# Anesthetics and analgesics
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Lidocaine 2%","description":"Local anesthetic injection","quantity":50,"unit":"vials","lowStockThreshold":15,"supplier":"AstraZeneca Nigeria","expiryDate":"2026-09-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Bupivacaine 0.5%","description":"Long-acting local anesthetic","quantity":30,"unit":"vials","lowStockThreshold":9,"supplier":"AstraZeneca Nigeria","expiryDate":"2026-11-12"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ketamine 50mg/ml","description":"Dissociative anesthetic","quantity":25,"unit":"vials","lowStockThreshold":8,"supplier":"Pfizer Nigeria","expiryDate":"2026-08-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Propofol 10mg/ml","description":"IV anesthetic agent","quantity":40,"unit":"vials","lowStockThreshold":12,"supplier":"AstraZeneca Nigeria","expiryDate":"2026-10-15"}'

# IV fluids and electrolytes
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Normal Saline 500ml","description":"0.9% sodium chloride IV fluid","quantity":100,"unit":"bags","lowStockThreshold":30,"supplier":"Baxter Nigeria","expiryDate":"2027-12-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Dextrose 5% 500ml","description":"5% glucose IV solution","quantity":80,"unit":"bags","lowStockThreshold":25,"supplier":"Baxter Nigeria","expiryDate":"2027-11-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ringer Lactate 500ml","description":"Balanced crystalloid solution","quantity":75,"unit":"bags","lowStockThreshold":22,"supplier":"Baxter Nigeria","expiryDate":"2027-10-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Potassium Chloride 15%","description":"Concentrated potassium for IV","quantity":40,"unit":"ampoules","lowStockThreshold":12,"supplier":"Fresenius Nigeria","expiryDate":"2027-06-30"}'

# Vaccines (common in Nigeria)
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Hepatitis B Vaccine","description":"Recombinant hepatitis B vaccine","quantity":50,"unit":"vials","lowStockThreshold":15,"supplier":"GSK Nigeria","expiryDate":"2026-12-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Tetanus Toxoid","description":"Tetanus prevention vaccine","quantity":60,"unit":"vials","lowStockThreshold":18,"supplier":"Sanofi Nigeria","expiryDate":"2027-03-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Yellow Fever Vaccine","description":"Live attenuated yellow fever vaccine","quantity":40,"unit":"vials","lowStockThreshold":12,"supplier":"Sanofi Nigeria","expiryDate":"2026-11-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Meningitis Vaccine","description":"Meningococcal ACWY vaccine","quantity":35,"unit":"vials","lowStockThreshold":10,"supplier":"GSK Nigeria","expiryDate":"2027-01-20"}'

# Hematological medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Warfarin 5mg","description":"Anticoagulant for thrombosis prevention","quantity":90,"unit":"tablets","lowStockThreshold":25,"supplier":"Bristol Myers Squibb","expiryDate":"2027-02-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Heparin 5000IU","description":"Anticoagulant injection","quantity":60,"unit":"vials","lowStockThreshold":18,"supplier":"Leo Pharma","expiryDate":"2026-10-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Clopidogrel 75mg","description":"Antiplatelet agent","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Bristol Myers Squibb","expiryDate":"2027-01-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Aspirin 81mg","description":"Low-dose antiplatelet therapy","quantity":150,"unit":"tablets","lowStockThreshold":45,"supplier":"Bayer Nigeria","expiryDate":"2027-08-20"}'

# Endocrine medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Levothyroxine 100mcg","description":"Thyroid hormone replacement","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Abbott Nigeria","expiryDate":"2027-03-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Methimazole 10mg","description":"Antithyroid medication","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Merck Nigeria","expiryDate":"2026-12-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Hydrocortisone 100mg","description":"Injectable corticosteroid","quantity":40,"unit":"vials","lowStockThreshold":12,"supplier":"Pfizer Nigeria","expiryDate":"2026-11-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Dexamethasone 4mg","description":"Potent corticosteroid","quantity":70,"unit":"tablets","lowStockThreshold":21,"supplier":"Merck Nigeria","expiryDate":"2027-02-15"}'

# Rheumatological medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Methotrexate 2.5mg","description":"Disease-modifying antirheumatic drug","quantity":50,"unit":"tablets","lowStockThreshold":15,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Sulfasalazine 500mg","description":"Anti-inflammatory for arthritis","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Pfizer Nigeria","expiryDate":"2026-10-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Hydroxychloroquine 200mg","description":"Antimalarial and immunosuppressant","quantity":70,"unit":"tablets","lowStockThreshold":21,"supplier":"Sanofi Nigeria","expiryDate":"2027-04-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Allopurinol 300mg","description":"Xanthine oxidase inhibitor for gout","quantity":90,"unit":"tablets","lowStockThreshold":27,"supplier":"GSK Nigeria","expiryDate":"2027-03-25"}'

# Additional common medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Paracetamol Syrup 120mg/5ml","description":"Pediatric acetaminophen suspension","quantity":60,"unit":"bottles","lowStockThreshold":18,"supplier":"GSK Nigeria","expiryDate":"2027-06-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ibuprofen Syrup 100mg/5ml","description":"Pediatric ibuprofen suspension","quantity":50,"unit":"bottles","lowStockThreshold":15,"supplier":"Pfizer Nigeria","expiryDate":"2027-05-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Oral Rehydration Salts","description":"WHO/UNICEF ORS for dehydration","quantity":200,"unit":"sachets","lowStockThreshold":60,"supplier":"WHO Nigeria","expiryDate":"2028-12-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Zinc Sulfate 20mg","description":"Zinc supplement for diarrhea","quantity":120,"unit":"tablets","lowStockThreshold":35,"supplier":"UNICEF Nigeria","expiryDate":"2027-09-30"}'

echo "Added emergency, anesthetic, IV fluids, vaccines, hematological, endocrine, rheumatological, and pediatric medications..."