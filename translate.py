import json
import urllib.request
import urllib.parse
import time
import os

def translate_text(text):
    if not text: return text
    if isinstance(text, list):
        return [translate_text(t) for t in text]
    if isinstance(text, dict):
        return {k: translate_text(v) for k, v in text.items()}
    
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=el&tl=en&dt=t&q=" + urllib.parse.quote(str(text))
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        # The result might be in chunks if text has multiple sentences
        result = "".join([d[0] for d in data[0] if d[0]])
        time.sleep(0.1) # Be nice to the API
        return result
    except Exception as e:
        print(f"Error translating: {text[:30]}... - {e}")
        return text

# Need to copy over categories manually because translation might slightly differ
category_map = {
    "Του Μπαμπούλα (που δεν είναι μόνο ψάρια)": "Baboulas's (not just fish)",
    "Της Φωτεινούλας (γλυκά και ζύμες)": "Foteinoula's (sweets and doughs)",
    "Της Ρηνούλας (για τους μερακλήδες)": "Rinoula's (for the foodies)",
    "Του Άλκη (με άρωμα εξωτερικού)": "Alkis's (with a foreign scent)",
    "Άλλο": "Other"
}

print("Loading recipes...")
with open("data/recipes.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Found {len(data['recipes'])} recipes to translate.")
for i, recipe in enumerate(data['recipes']):
    print(f"Translating recipe {i+1}/{len(data['recipes'])}: {recipe.get('title')}")
    recipe['title'] = translate_text(recipe.get('title'))
    if recipe.get('description'):
        recipe['description'] = translate_text(recipe.get('description'))
    if recipe.get('ingredients'):
        recipe['ingredients'] = translate_text(recipe.get('ingredients'))
    if recipe.get('steps'):
        recipe['steps'] = translate_text(recipe.get('steps'))
    
    if recipe.get('memory'):
        if recipe['memory'].get('title'):
            recipe['memory']['title'] = translate_text(recipe['memory']['title'])
        if recipe['memory'].get('story'):
            recipe['memory']['story'] = translate_text(recipe['memory']['story'])
            
    # Translate category safely
    if recipe.get('category'):
        recipe['category'] = category_map.get(recipe['category'], recipe['category'])
        
    if recipe.get('prepTime'):
        recipe['prepTime'] = recipe['prepTime'].replace('λεπτά', 'mins')
    if recipe.get('cookTime'):
        recipe['cookTime'] = recipe['cookTime'].replace('λεπτά', 'mins')

with open("data/recipes.en.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Translation complete! Saved to data/recipes.en.json")
