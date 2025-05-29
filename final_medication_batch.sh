#!/bin/bash

BASE_URL="http://localhost:5000/api/medicines"

# Additional cardiovascular medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Amlodipine 10mg","description":"Calcium channel blocker for hypertension","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Pfizer Nigeria","expiryDate":"2027-02-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Lisinopril 20mg","description":"ACE inhibitor for heart failure","quantity":90,"unit":"tablets","lowStockThreshold":27,"supplier":"Merck Nigeria","expiryDate":"2027-01-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Simvastatin 40mg","description":"Statin for cholesterol management","quantity":110,"unit":"tablets","lowStockThreshold":33,"supplier":"Merck Nigeria","expiryDate":"2027-03-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Atorvastatin 80mg","description":"High-intensity statin","quantity":95,"unit":"tablets","lowStockThreshold":28,"supplier":"Pfizer Nigeria","expiryDate":"2026-12-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Bisoprolol 5mg","description":"Selective beta-blocker","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Merck Nigeria","expiryDate":"2027-04-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Digoxin 0.25mg","description":"Cardiac glycoside for heart failure","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"GSK Nigeria","expiryDate":"2026-11-15"}'

# More diabetes medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Glimepiride 4mg","description":"Sulfonylurea for type 2 diabetes","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"Sanofi Nigeria","expiryDate":"2027-02-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Empagliflozin 25mg","description":"SGLT2 inhibitor for diabetes","quantity":70,"unit":"tablets","lowStockThreshold":21,"supplier":"Boehringer Ingelheim","expiryDate":"2027-01-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Liraglutide 18mg","description":"GLP-1 receptor agonist injection","quantity":40,"unit":"pens","lowStockThreshold":12,"supplier":"Novo Nordisk","expiryDate":"2026-10-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Insulin Glargine 100U/ml","description":"Long-acting insulin","quantity":60,"unit":"vials","lowStockThreshold":18,"supplier":"Sanofi Nigeria","expiryDate":"2026-12-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Insulin Aspart 100U/ml","description":"Rapid-acting insulin","quantity":55,"unit":"vials","lowStockThreshold":16,"supplier":"Novo Nordisk","expiryDate":"2027-01-30"}'

# Additional respiratory medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Salmeterol/Fluticasone","description":"Combination inhaler for asthma","quantity":40,"unit":"inhalers","lowStockThreshold":12,"supplier":"GSK Nigeria","expiryDate":"2026-11-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Tiotropium Bromide","description":"Long-acting bronchodilator","quantity":35,"unit":"inhalers","lowStockThreshold":10,"supplier":"Boehringer Ingelheim","expiryDate":"2027-02-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Prednisone 20mg","description":"Oral corticosteroid","quantity":90,"unit":"tablets","lowStockThreshold":27,"supplier":"Pfizer Nigeria","expiryDate":"2027-03-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Carbocisteine 375mg","description":"Mucolytic for respiratory conditions","quantity":75,"unit":"capsules","lowStockThreshold":22,"supplier":"Sanofi Nigeria","expiryDate":"2026-12-20"}'

# Additional gastrointestinal medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Pantoprazole 40mg","description":"Proton pump inhibitor","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Nycomed Nigeria","expiryDate":"2027-01-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Esomeprazole 40mg","description":"Proton pump inhibitor","quantity":95,"unit":"capsules","lowStockThreshold":28,"supplier":"AstraZeneca Nigeria","expiryDate":"2026-11-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Domperidone 10mg","description":"Prokinetic antiemetic","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Janssen Nigeria","expiryDate":"2027-02-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Hyoscine Butylbromide 20mg","description":"Antispasmodic for abdominal pain","quantity":70,"unit":"tablets","lowStockThreshold":21,"supplier":"Boehringer Ingelheim","expiryDate":"2027-04-10"}'

# Additional analgesics and NSAIDs
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Etoricoxib 90mg","description":"COX-2 selective NSAID","quantity":75,"unit":"tablets","lowStockThreshold":22,"supplier":"Merck Nigeria","expiryDate":"2027-01-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Aceclofenac 100mg","description":"NSAID for pain and inflammation","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"Abbott Nigeria","expiryDate":"2026-12-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Topical Diclofenac Gel","description":"Topical NSAID for joint pain","quantity":60,"unit":"tubes","lowStockThreshold":18,"supplier":"Novartis Nigeria","expiryDate":"2027-03-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Paracetamol/Caffeine 500mg","description":"Analgesic with caffeine","quantity":120,"unit":"tablets","lowStockThreshold":35,"supplier":"GSK Nigeria","expiryDate":"2027-05-20"}'

# Antibiotics for special infections
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Minocycline 100mg","description":"Tetracycline antibiotic","quantity":60,"unit":"capsules","lowStockThreshold":18,"supplier":"Wyeth Nigeria","expiryDate":"2026-11-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ceftriaxone 1g","description":"Third-generation cephalosporin","quantity":50,"unit":"vials","lowStockThreshold":15,"supplier":"Roche Nigeria","expiryDate":"2026-10-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Cefixime 400mg","description":"Third-generation cephalosporin","quantity":80,"unit":"capsules","lowStockThreshold":24,"supplier":"Lupin Nigeria","expiryDate":"2027-02-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Nitrofurantoin 100mg","description":"Antibiotic for urinary tract infections","quantity":90,"unit":"capsules","lowStockThreshold":27,"supplier":"Goldshield Nigeria","expiryDate":"2027-01-30"}'

# Additional vitamins and minerals
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Magnesium Oxide 400mg","description":"Magnesium supplement","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Nature Made Nigeria","expiryDate":"2027-08-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Potassium Citrate 99mg","description":"Potassium supplement","quantity":85,"unit":"tablets","lowStockThreshold":25,"supplier":"NOW Nigeria","expiryDate":"2027-06-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Vitamin E 400IU","description":"Alpha-tocopherol supplement","quantity":110,"unit":"capsules","lowStockThreshold":33,"supplier":"Solgar Nigeria","expiryDate":"2027-09-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Omega-3 Fish Oil","description":"EPA/DHA supplement","quantity":95,"unit":"capsules","lowStockThreshold":28,"supplier":"Nordic Naturals","expiryDate":"2027-04-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Probiotics Multi-strain","description":"Beneficial bacteria supplement","quantity":70,"unit":"capsules","lowStockThreshold":21,"supplier":"Garden of Life","expiryDate":"2027-03-31"}'

# Specialized maternal health medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Methyldopa 250mg","description":"Antihypertensive safe in pregnancy","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Merck Nigeria","expiryDate":"2027-02-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ferrous Gluconate 325mg","description":"Iron supplement for pregnancy","quantity":120,"unit":"tablets","lowStockThreshold":35,"supplier":"Nature Made Nigeria","expiryDate":"2027-12-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Prenatal Vitamins","description":"Complete prenatal vitamin supplement","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"Rainbow Light Nigeria","expiryDate":"2027-08-30"}'

# Additional emergency medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Adenosine 6mg","description":"Antiarrhythmic for SVT","quantity":20,"unit":"vials","lowStockThreshold":6,"supplier":"Sanofi Nigeria","expiryDate":"2026-09-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Amiodarone 200mg","description":"Antiarrhythmic medication","quantity":40,"unit":"tablets","lowStockThreshold":12,"supplier":"Sanofi Nigeria","expiryDate":"2027-01-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Nitroglycerin 0.4mg","description":"Sublingual for angina","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Pfizer Nigeria","expiryDate":"2026-11-25"}'

# Antihistamines and allergy medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Cetirizine 10mg","description":"Second-generation antihistamine","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"UCB Nigeria","expiryDate":"2027-04-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Loratadine 10mg","description":"Non-sedating antihistamine","quantity":90,"unit":"tablets","lowStockThreshold":27,"supplier":"Schering-Plough Nigeria","expiryDate":"2027-02-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Prednisolone 5mg","description":"Corticosteroid for allergic reactions","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Pfizer Nigeria","expiryDate":"2027-03-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Epinephrine Auto-injector","description":"Emergency treatment for anaphylaxis","quantity":25,"unit":"devices","lowStockThreshold":8,"supplier":"Mylan Nigeria","expiryDate":"2026-12-31"}'

# More specialized medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Colchicine 0.6mg","description":"Anti-inflammatory for gout","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"West-Ward Nigeria","expiryDate":"2027-01-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Probenecid 500mg","description":"Uricosuric agent for gout","quantity":50,"unit":"tablets","lowStockThreshold":15,"supplier":"Merck Nigeria","expiryDate":"2026-11-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Calcitriol 0.25mcg","description":"Active vitamin D for bone health","quantity":70,"unit":"capsules","lowStockThreshold":21,"supplier":"Roche Nigeria","expiryDate":"2027-02-20"}'

echo "Added comprehensive cardiovascular, diabetes, respiratory, GI, analgesic, antibiotic, vitamin, maternal health, emergency, antihistamine, and specialized medications..."