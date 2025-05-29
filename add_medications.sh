#!/bin/bash

# Comprehensive medication inventory for Nigerian clinic
BASE_URL="http://localhost:5000/api/medicines"

# Antibiotics
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Erythromycin 500mg","description":"Macrolide antibiotic for respiratory infections","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Clarithromycin 500mg","description":"Macrolide antibiotic for H. pylori and respiratory infections","quantity":70,"unit":"tablets","lowStockThreshold":20,"supplier":"Abbott Nigeria","expiryDate":"2026-11-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Clindamycin 300mg","description":"Lincosamide antibiotic for anaerobic infections","quantity":60,"unit":"capsules","lowStockThreshold":18,"supplier":"Pfizer Nigeria","expiryDate":"2027-02-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Tetracycline 250mg","description":"Broad-spectrum antibiotic","quantity":120,"unit":"capsules","lowStockThreshold":30,"supplier":"Emzor Pharmaceuticals","expiryDate":"2026-12-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Chloramphenicol 250mg","description":"Broad-spectrum antibiotic for serious infections","quantity":50,"unit":"capsules","lowStockThreshold":15,"supplier":"May & Baker Nigeria","expiryDate":"2027-05-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Trimethoprim/Sulfamethoxazole","description":"Antibiotic combination for UTIs and pneumonia","quantity":110,"unit":"tablets","lowStockThreshold":30,"supplier":"GSK Nigeria","expiryDate":"2027-03-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Gentamicin 80mg","description":"Aminoglycoside antibiotic injection","quantity":40,"unit":"vials","lowStockThreshold":12,"supplier":"Roche Nigeria","expiryDate":"2026-09-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Streptomycin 1g","description":"Aminoglycoside for tuberculosis","quantity":30,"unit":"vials","lowStockThreshold":10,"supplier":"Sanofi Nigeria","expiryDate":"2027-01-08"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Rifampicin 300mg","description":"Anti-tuberculosis antibiotic","quantity":80,"unit":"capsules","lowStockThreshold":25,"supplier":"Lupin Nigeria","expiryDate":"2027-04-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Isoniazid 300mg","description":"First-line anti-tuberculosis drug","quantity":90,"unit":"tablets","lowStockThreshold":25,"supplier":"Lupin Nigeria","expiryDate":"2027-06-12"}'

# Antivirals
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Acyclovir 400mg","description":"Antiviral for herpes infections","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"GSK Nigeria","expiryDate":"2026-10-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Oseltamivir 75mg","description":"Antiviral for influenza","quantity":40,"unit":"capsules","lowStockThreshold":12,"supplier":"Roche Nigeria","expiryDate":"2027-01-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Zidovudine 300mg","description":"Antiretroviral for HIV","quantity":35,"unit":"tablets","lowStockThreshold":10,"supplier":"GSK Nigeria","expiryDate":"2026-12-31"}'

# Analgesics & NSAIDs
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Naproxen 500mg","description":"NSAID for pain and inflammation","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Bayer Nigeria","expiryDate":"2027-02-14"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Celecoxib 200mg","description":"COX-2 selective NSAID","quantity":75,"unit":"capsules","lowStockThreshold":22,"supplier":"Pfizer Nigeria","expiryDate":"2026-11-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Meloxicam 15mg","description":"NSAID for arthritis and pain","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Boehringer Ingelheim","expiryDate":"2027-01-22"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Piroxicam 20mg","description":"NSAID for inflammatory conditions","quantity":65,"unit":"capsules","lowStockThreshold":20,"supplier":"Pfizer Nigeria","expiryDate":"2026-09-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Morphine 10mg","description":"Opioid analgesic for severe pain","quantity":25,"unit":"tablets","lowStockThreshold":8,"supplier":"Janssen Nigeria","expiryDate":"2026-08-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Pethidine 50mg","description":"Opioid analgesic injection","quantity":20,"unit":"ampoules","lowStockThreshold":6,"supplier":"Roche Nigeria","expiryDate":"2026-12-20"}'

# Cardiovascular medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Enalapril 10mg","description":"ACE inhibitor for hypertension","quantity":120,"unit":"tablets","lowStockThreshold":35,"supplier":"Merck Nigeria","expiryDate":"2027-03-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Captopril 25mg","description":"ACE inhibitor for hypertension and heart failure","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Bristol Myers Squibb","expiryDate":"2026-11-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Losartan 50mg","description":"ARB for hypertension","quantity":110,"unit":"tablets","lowStockThreshold":32,"supplier":"Merck Nigeria","expiryDate":"2027-04-08"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Valsartan 80mg","description":"ARB for hypertension and heart failure","quantity":95,"unit":"tablets","lowStockThreshold":28,"supplier":"Novartis Nigeria","expiryDate":"2027-01-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Diltiazem 60mg","description":"Calcium channel blocker for angina","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"Bayer Nigeria","expiryDate":"2026-10-12"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Verapamil 80mg","description":"Calcium channel blocker for arrhythmias","quantity":70,"unit":"tablets","lowStockThreshold":21,"supplier":"Abbott Nigeria","expiryDate":"2027-02-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Atenolol 50mg","description":"Beta-blocker for hypertension","quantity":130,"unit":"tablets","lowStockThreshold":38,"supplier":"AstraZeneca Nigeria","expiryDate":"2027-05-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Metoprolol 50mg","description":"Beta-blocker for hypertension and angina","quantity":105,"unit":"tablets","lowStockThreshold":30,"supplier":"AstraZeneca Nigeria","expiryDate":"2026-12-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Carvedilol 25mg","description":"Alpha-beta blocker for heart failure","quantity":75,"unit":"tablets","lowStockThreshold":22,"supplier":"GSK Nigeria","expiryDate":"2027-03-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Spironolactone 25mg","description":"Potassium-sparing diuretic","quantity":90,"unit":"tablets","lowStockThreshold":27,"supplier":"Pfizer Nigeria","expiryDate":"2027-01-25"}'

# Diabetes medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Gliclazide 80mg","description":"Sulfonylurea for type 2 diabetes","quantity":150,"unit":"tablets","lowStockThreshold":40,"supplier":"Servier Nigeria","expiryDate":"2027-02-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Pioglitazone 30mg","description":"Thiazolidinedione for type 2 diabetes","quantity":90,"unit":"tablets","lowStockThreshold":25,"supplier":"Takeda Nigeria","expiryDate":"2026-11-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Sitagliptin 100mg","description":"DPP-4 inhibitor for diabetes","quantity":80,"unit":"tablets","lowStockThreshold":22,"supplier":"Merck Nigeria","expiryDate":"2027-01-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Acarbose 50mg","description":"Alpha-glucosidase inhibitor for diabetes","quantity":70,"unit":"tablets","lowStockThreshold":20,"supplier":"Bayer Nigeria","expiryDate":"2026-12-25"}'

# Gastrointestinal medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Loperamide 2mg","description":"Antidiarrheal medication","quantity":120,"unit":"capsules","lowStockThreshold":35,"supplier":"Janssen Nigeria","expiryDate":"2027-03-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Metoclopramide 10mg","description":"Antiemetic and prokinetic agent","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Sanofi Nigeria","expiryDate":"2027-01-12"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Lactulose 667mg","description":"Osmotic laxative for constipation","quantity":60,"unit":"bottles","lowStockThreshold":18,"supplier":"Abbott Nigeria","expiryDate":"2026-10-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Simethicone 40mg","description":"Anti-flatulent for gas and bloating","quantity":90,"unit":"tablets","lowStockThreshold":25,"supplier":"Pfizer Nigeria","expiryDate":"2027-05-08"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Sucralfate 1g","description":"Gastric protectant for ulcers","quantity":75,"unit":"tablets","lowStockThreshold":22,"supplier":"Teva Nigeria","expiryDate":"2026-09-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Famotidine 40mg","description":"H2 receptor antagonist for acid reflux","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"Merck Nigeria","expiryDate":"2027-02-28"}'

# Respiratory medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Theophylline 200mg","description":"Bronchodilator for asthma and COPD","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Abbott Nigeria","expiryDate":"2026-11-12"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Montelukast 10mg","description":"Leukotriene receptor antagonist for asthma","quantity":70,"unit":"tablets","lowStockThreshold":20,"supplier":"Merck Nigeria","expiryDate":"2027-04-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ipratropium Bromide","description":"Anticholinergic bronchodilator inhaler","quantity":30,"unit":"inhalers","lowStockThreshold":8,"supplier":"Boehringer Ingelheim","expiryDate":"2026-12-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Budesonide 200mcg","description":"Inhaled corticosteroid for asthma","quantity":35,"unit":"inhalers","lowStockThreshold":10,"supplier":"AstraZeneca Nigeria","expiryDate":"2027-01-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Dextromethorphan 15mg","description":"Cough suppressant","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Reckitt Nigeria","expiryDate":"2026-10-05"}'

# Neurological and psychiatric medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Phenytoin 100mg","description":"Anticonvulsant for epilepsy","quantity":90,"unit":"capsules","lowStockThreshold":25,"supplier":"Pfizer Nigeria","expiryDate":"2027-03-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Carbamazepine 200mg","description":"Anticonvulsant for epilepsy and neuropathic pain","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"Novartis Nigeria","expiryDate":"2026-11-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Valproic Acid 500mg","description":"Anticonvulsant for epilepsy and bipolar disorder","quantity":70,"unit":"tablets","lowStockThreshold":20,"supplier":"Abbott Nigeria","expiryDate":"2027-02-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Levodopa/Carbidopa","description":"Antiparkinson medication","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Merck Nigeria","expiryDate":"2026-12-08"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Haloperidol 5mg","description":"Antipsychotic for schizophrenia","quantity":50,"unit":"tablets","lowStockThreshold":15,"supplier":"Janssen Nigeria","expiryDate":"2027-01-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Chlorpromazine 100mg","description":"Antipsychotic for psychiatric disorders","quantity":55,"unit":"tablets","lowStockThreshold":16,"supplier":"Sanofi Nigeria","expiryDate":"2026-10-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Diazepam 5mg","description":"Benzodiazepine for anxiety and seizures","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Roche Nigeria","expiryDate":"2027-04-08"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Lorazepam 2mg","description":"Benzodiazepine for anxiety disorders","quantity":65,"unit":"tablets","lowStockThreshold":18,"supplier":"Pfizer Nigeria","expiryDate":"2026-09-30"}'

echo "Added neurological medications..."