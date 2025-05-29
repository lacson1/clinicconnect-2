#!/bin/bash

BASE_URL="http://localhost:5000/api/medicines"

# Chemotherapy and oncology medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Cyclophosphamide 500mg","description":"Alkylating agent for cancer therapy","quantity":20,"unit":"vials","lowStockThreshold":6,"supplier":"Baxter Nigeria","expiryDate":"2026-09-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Doxorubicin 50mg","description":"Anthracycline chemotherapy agent","quantity":15,"unit":"vials","lowStockThreshold":5,"supplier":"Pfizer Nigeria","expiryDate":"2026-11-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Cisplatin 50mg","description":"Platinum-based chemotherapy","quantity":18,"unit":"vials","lowStockThreshold":6,"supplier":"Teva Nigeria","expiryDate":"2026-10-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"5-Fluorouracil 250mg","description":"Antimetabolite chemotherapy","quantity":25,"unit":"vials","lowStockThreshold":8,"supplier":"Roche Nigeria","expiryDate":"2027-01-25"}'

# Tropical disease medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Artesunate 60mg","description":"Antimalarial for severe malaria","quantity":80,"unit":"vials","lowStockThreshold":24,"supplier":"Guilin Pharmaceutical","expiryDate":"2027-03-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Quinine 300mg","description":"Antimalarial for chloroquine-resistant malaria","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Sanofi Nigeria","expiryDate":"2027-02-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Doxycycline 100mg","description":"Antibiotic for malaria prophylaxis","quantity":120,"unit":"capsules","lowStockThreshold":35,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Praziquantel 600mg","description":"Anthelmintic for schistosomiasis","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Merck Nigeria","expiryDate":"2026-12-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Albendazole 400mg","description":"Broad-spectrum anthelmintic","quantity":90,"unit":"tablets","lowStockThreshold":25,"supplier":"GSK Nigeria","expiryDate":"2027-04-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Mebendazole 100mg","description":"Anthelmintic for roundworm infections","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Janssen Nigeria","expiryDate":"2027-03-20"}'

# Additional antibiotics and antimicrobials
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Vancomycin 500mg","description":"Glycopeptide antibiotic for MRSA","quantity":30,"unit":"vials","lowStockThreshold":9,"supplier":"Pfizer Nigeria","expiryDate":"2026-11-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Linezolid 600mg","description":"Oxazolidinone antibiotic","quantity":40,"unit":"tablets","lowStockThreshold":12,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Meropenem 1g","description":"Carbapenem antibiotic for severe infections","quantity":25,"unit":"vials","lowStockThreshold":8,"supplier":"AstraZeneca Nigeria","expiryDate":"2026-10-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Piperacillin/Tazobactam 4.5g","description":"Beta-lactam/beta-lactamase inhibitor","quantity":35,"unit":"vials","lowStockThreshold":10,"supplier":"Pfizer Nigeria","expiryDate":"2026-12-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Azithromycin 500mg","description":"Macrolide antibiotic","quantity":90,"unit":"tablets","lowStockThreshold":25,"supplier":"Pfizer Nigeria","expiryDate":"2027-02-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Levofloxacin 500mg","description":"Fluoroquinolone antibiotic","quantity":75,"unit":"tablets","lowStockThreshold":22,"supplier":"Janssen Nigeria","expiryDate":"2027-01-12"}'

# Pain management and anesthesia
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Tramadol 50mg","description":"Centrally acting analgesic","quantity":120,"unit":"tablets","lowStockThreshold":35,"supplier":"Grunenthal Nigeria","expiryDate":"2027-03-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Codeine 30mg","description":"Opioid analgesic","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Mallinckrodt Nigeria","expiryDate":"2026-11-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Fentanyl 50mcg/ml","description":"Potent opioid analgesic","quantity":20,"unit":"ampoules","lowStockThreshold":6,"supplier":"Janssen Nigeria","expiryDate":"2026-09-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Midazolam 5mg/ml","description":"Benzodiazepine sedative","quantity":30,"unit":"ampoules","lowStockThreshold":9,"supplier":"Roche Nigeria","expiryDate":"2026-12-08"}'

# Mental health medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Fluoxetine 20mg","description":"SSRI antidepressant","quantity":90,"unit":"capsules","lowStockThreshold":25,"supplier":"Eli Lilly Nigeria","expiryDate":"2027-02-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Sertraline 50mg","description":"SSRI antidepressant","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Amitriptyline 25mg","description":"Tricyclic antidepressant","quantity":70,"unit":"tablets","lowStockThreshold":20,"supplier":"Sandoz Nigeria","expiryDate":"2026-11-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Risperidone 2mg","description":"Atypical antipsychotic","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Janssen Nigeria","expiryDate":"2027-04-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Olanzapine 10mg","description":"Atypical antipsychotic","quantity":50,"unit":"tablets","lowStockThreshold":15,"supplier":"Eli Lilly Nigeria","expiryDate":"2026-12-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Lithium Carbonate 300mg","description":"Mood stabilizer for bipolar disorder","quantity":65,"unit":"tablets","lowStockThreshold":18,"supplier":"Sanofi Nigeria","expiryDate":"2027-03-12"}'

# Specialized medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Sildenafil 100mg","description":"PDE5 inhibitor for erectile dysfunction","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Tadalafil 20mg","description":"PDE5 inhibitor","quantity":50,"unit":"tablets","lowStockThreshold":15,"supplier":"Eli Lilly Nigeria","expiryDate":"2026-11-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Misoprostol 200mcg","description":"Prostaglandin for gastric protection","quantity":70,"unit":"tablets","lowStockThreshold":20,"supplier":"Pfizer Nigeria","expiryDate":"2027-02-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ergometrine 0.2mg","description":"Oxytocic for postpartum hemorrhage","quantity":40,"unit":"ampoules","lowStockThreshold":12,"supplier":"Novartis Nigeria","expiryDate":"2026-10-31"}'

echo "Added chemotherapy, tropical disease, advanced antibiotics, pain management, mental health, and specialized medications..."