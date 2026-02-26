import pandas as pd
from duckduckgo_search import DDGS
import time

# Load your dataset
df = pd.read_csv('recipes.csv')

def get_image_url(recipe_name):
    """Searches DuckDuckGo for the recipe image."""
    try:
        with DDGS() as ddgs:
            # Search for images with the recipe name
            results = list(ddgs.images(
                keywords=f"{recipe_name} cooked food", 
                max_results=1
            ))
            
            # If we get a result, return the image URL
            if results:
                return results[0]['image']
                
    except Exception as e:
        print(f"  Error finding image for {recipe_name}: {e}")
    
    return None

print("Starting update using DuckDuckGo...")

# Loop through the recipes
for index, row in df.iterrows():
    recipe_name = row['name']
    print(f"Searching: {recipe_name}")
    
    new_url = get_image_url(recipe_name)
    
    if new_url:
        df.at[index, 'image_url'] = new_url
        print(f"  Found: {new_url[:50]}...") # Print first 50 chars of URL
    else:
        print("  No image found.")
        
    # Small pause to be polite to the server
    time.sleep(0.75)

# Save the updated file
output_file = 'recipes_updated_ddg.csv'
df.to_csv(output_file, index=False)
print(f"\nSuccess! Saved updated dataset to: {output_file}")
