#!/bin/bash

BASE_URL="http://localhost:5000/api/medicines"

# Dermatological medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Betamethasone 0.1%","description":"Potent topical corticosteroid cream","quantity":60,"unit":"tubes","lowStockThreshold":18,"supplier":"GSK Nigeria","expiryDate":"2027-02-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Miconazole 2%","description":"Antifungal cream for skin infections","quantity":75,"unit":"tubes","lowStockThreshold":22,"supplier":"Janssen Nigeria","expiryDate":"2026-11-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ketoconazole 2%","description":"Antifungal shampoo and cream","quantity":50,"unit":"bottles","lowStockThreshold":15,"supplier":"Janssen Nigeria","expiryDate":"2027-01-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Tretinoin 0.025%","description":"Topical retinoid for acne","quantity":40,"unit":"tubes","lowStockThreshold":12,"supplier":"Johnson & Johnson","expiryDate":"2026-12-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Calamine Lotion","description":"Soothing lotion for skin irritation","quantity":80,"unit":"bottles","lowStockThreshold":24,"supplier":"Calamine Nigeria","expiryDate":"2028-06-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Mupirocin 2%","description":"Topical antibiotic for skin infections","quantity":35,"unit":"tubes","lowStockThreshold":10,"supplier":"GSK Nigeria","expiryDate":"2026-10-18"}'

# Ophthalmological medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Chloramphenicol Eye Drops","description":"Antibiotic eye drops for conjunctivitis","quantity":50,"unit":"bottles","lowStockThreshold":15,"supplier":"Allergan Nigeria","expiryDate":"2026-09-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Timolol 0.5%","description":"Beta-blocker eye drops for glaucoma","quantity":30,"unit":"bottles","lowStockThreshold":9,"supplier":"Merck Nigeria","expiryDate":"2027-01-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Artificial Tears","description":"Lubricating eye drops for dry eyes","quantity":60,"unit":"bottles","lowStockThreshold":18,"supplier":"Alcon Nigeria","expiryDate":"2027-08-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Prednisolone Eye Drops","description":"Corticosteroid eye drops for inflammation","quantity":25,"unit":"bottles","lowStockThreshold":8,"supplier":"Allergan Nigeria","expiryDate":"2026-11-25"}'

# ENT medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Oxymetazoline Nasal Spray","description":"Decongestant nasal spray","quantity":45,"unit":"bottles","lowStockThreshold":12,"supplier":"Afrin Nigeria","expiryDate":"2027-03-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Saline Nasal Spray","description":"Isotonic saline for nasal irrigation","quantity":70,"unit":"bottles","lowStockThreshold":20,"supplier":"Ocean Nigeria","expiryDate":"2028-12-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Ciprofloxacin Ear Drops","description":"Antibiotic ear drops for otitis externa","quantity":40,"unit":"bottles","lowStockThreshold":12,"supplier":"Alcon Nigeria","expiryDate":"2026-10-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Wax Removal Drops","description":"Cerumenolytic for ear wax removal","quantity":35,"unit":"bottles","lowStockThreshold":10,"supplier":"Audiclean Nigeria","expiryDate":"2027-06-20"}'

# Gynecological medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Clotrimazole Vaginal Tablets","description":"Antifungal for vaginal candidiasis","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Bayer Nigeria","expiryDate":"2027-01-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Metronidazole Vaginal Gel","description":"Antibiotic gel for bacterial vaginosis","quantity":40,"unit":"tubes","lowStockThreshold":12,"supplier":"Pfizer Nigeria","expiryDate":"2026-09-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Conjugated Estrogens","description":"Hormone replacement therapy","quantity":50,"unit":"tablets","lowStockThreshold":15,"supplier":"Pfizer Nigeria","expiryDate":"2027-02-28"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Progesterone 200mg","description":"Natural progesterone capsules","quantity":45,"unit":"capsules","lowStockThreshold":12,"supplier":"Utrogestan Nigeria","expiryDate":"2026-12-15"}'

# Urological medications
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Tamsulosin 0.4mg","description":"Alpha-blocker for benign prostatic hyperplasia","quantity":80,"unit":"capsules","lowStockThreshold":24,"supplier":"Boehringer Ingelheim","expiryDate":"2027-03-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Finasteride 5mg","description":"5-alpha reductase inhibitor for BPH","quantity":70,"unit":"tablets","lowStockThreshold":21,"supplier":"Merck Nigeria","expiryDate":"2026-11-18"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Oxybutynin 5mg","description":"Anticholinergic for overactive bladder","quantity":60,"unit":"tablets","lowStockThreshold":18,"supplier":"Janssen Nigeria","expiryDate":"2027-01-12"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Cranberry Extract","description":"Urinary tract health supplement","quantity":90,"unit":"capsules","lowStockThreshold":25,"supplier":"Nature\'s Way Nigeria","expiryDate":"2027-08-30"}'

# Vitamins and supplements
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Vitamin B Complex","description":"B-vitamin complex supplement","quantity":150,"unit":"tablets","lowStockThreshold":45,"supplier":"Seven Seas Nigeria","expiryDate":"2027-12-31"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Vitamin C 1000mg","description":"Ascorbic acid supplement","quantity":200,"unit":"tablets","lowStockThreshold":60,"supplier":"Redoxon Nigeria","expiryDate":"2028-03-15"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Vitamin D3 1000IU","description":"Cholecalciferol supplement","quantity":120,"unit":"tablets","lowStockThreshold":35,"supplier":"Nature Made Nigeria","expiryDate":"2027-09-20"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Folic Acid 5mg","description":"Folate supplement for anemia","quantity":100,"unit":"tablets","lowStockThreshold":30,"supplier":"GSK Nigeria","expiryDate":"2027-06-10"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Iron Sulfate 325mg","description":"Iron supplement for iron deficiency","quantity":80,"unit":"tablets","lowStockThreshold":24,"supplier":"Feosol Nigeria","expiryDate":"2027-04-25"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Calcium Carbonate 1250mg","description":"Calcium supplement","quantity":140,"unit":"tablets","lowStockThreshold":40,"supplier":"Caltrate Nigeria","expiryDate":"2028-01-30"}'
curl -s -X POST "$BASE_URL" -H "Content-Type: application/json" -d '{"name":"Multivitamin Tablets","description":"Complete daily vitamin supplement","quantity":180,"unit":"tablets","lowStockThreshold":50,"supplier":"Centrum Nigeria","expiryDate":"2027-11-15"}'

echo "Added dermatological, ophthalmological, ENT, gynecological, urological, and vitamin medications..."