#!/usr/bin/env python3
"""
Comprehensive analysis of French corpus source distribution
Using more sentences from the provided corpus data
"""

import re
from collections import defaultdict

def categorize_sentence(sentence):
    """Categorize a sentence based on content and linguistic markers"""
    sentence_lower = sentence.lower()
    
    # Technical/System contexts
    if re.search(r'système|processus|installation|logiciel|software|serveur|données|fichier|ordinateur|redémarre|mises à jour|paramètres|configuration|version|application|programme|code|algorithme|protocole|méthode|technique', sentence_lower):
        return 'Technical'
    
    # Journalistic contexts
    if re.search(r'minute.*avant.*inscrive.*but|équipe|match|sport|selon|rapporte|déclare|annonce|autorités|gouvernement|ministre|bilan|pompiers|incendie|journal|presse|média|actualité|information|nouvelle', sentence_lower):
        return 'Journalistic'
    
    # Literary/Narrative contexts
    if re.search(r'personnages|aventuriers|héros|protagoniste|roman|récit|histoire|conte|il était une fois|il fallait|elle attendait|craignant|irréparable.*se produise|colons français|révolution|territoire.*habité|bien avant que.*débarquent|littéraire|poétique|narratif', sentence_lower):
        return 'Literary'
    
    # Academic/Research contexts
    if re.search(r'recherche|étude|analyse|université|utilisation.*répandue.*recommandée|contexte.*canadien|commission|rapport|évaluation|scientifique|académique|théorie|hypothèse|méthodologie|corpus|linguistique', sentence_lower):
        return 'Academic'
    
    # Administrative/Legal contexts
    if re.search(r'il convient|validation|approbation|contrat|signature|autorisation|conformément|selon.*loi|réglementation|conseil municipal|maire|délibération|procédure.*administrative|juridique|légal|officiel', sentence_lower):
        return 'Administrative/Legal'
    
    # Business/Commercial contexts
    if re.search(r'entreprise|société|client|marché|vente|achat|commande|livraison|budget|coût|prix|économie|projet.*arrêté|développement|commercial|business|industrie|production', sentence_lower):
        return 'Business/Commercial'
    
    # Medical/Health contexts
    if re.search(r'médecin|docteur|hôpital|patient|traitement|médicament|symptômes|maladie|infection|virus|santé|consultation|diagnostic|thérapie|médical|clinique|soins', sentence_lower):
        return 'Medical/Health'
    
    # Conversational/Social contexts
    if re.search(r'faut qu\'on|bon.*il faut|allez.*dépêche|tu.*mieux|on devrait|je pense qu\'on|ça ferme|ça commence|ça se passe|avant qu\'on|avant que tu|avant que je|super|cool|génial|sympa|conversation|discussion|chat|forum', sentence_lower):
        return 'Conversational/Social'
    
    # Educational contexts
    if re.search(r'école|élève|étudiant|professeur|cours|leçon|apprentissage|formation|éducation|enseignement|classe|université|collège|lycée', sentence_lower):
        return 'Educational'
    
    # News/Media contexts
    if re.search(r'actualité|information|nouvelle|média|presse|journal|télévision|radio|internet|site web|blog|article|publication', sentence_lower):
        return 'News/Media'
    
    return 'Other/General'

# Extended sample from the corpus (using more sentences from the provided data)
extended_corpus = [
    # WITH EXPLETIVE examples from corpus
    "Qu'en était-il de la vie de vos personnages avant qu'ils ne soient des aventuriers ?",
    "Par exemple, le Cargolifter allemand ambitionnait de répondre à toutes les applications possibles avant que le projet ne soit arrêté.",
    "Avant que la Moonwatch n'élève la Speedmaster au rang de légende, la collection a d'abord accompagné les pilotes de course.",
    "Il s'agit donc de soigner et si possible guérir les affections avant qu'elles n'atteignent un stade d'irréversibilité inéluctable",
    "Le processus de construction implique une phase de creusement et une phase de mélange, où le terrain local est mélangé à de l'eau et à des additifs, avant que la construction ne commence.",
    "Éliminez les erreurs de traitement et augmentez la sécurité de votre compte en demandant à un autre membre de votre équipe d'examiner chaque transaction avant que l'argent ne quitte votre compte.",
    "Il faut que je t'avertisse que la prochaine fois, tu seras président de ton monde natal",
    "Dans la désormais grande famille des groupes de l'hexagone interprétant des musiques des Balkans, ils font figure de précurseurs puisqu'ils ont débuté bien avant que ces musiques ne connaissent la mode actuelle.",
    "Il a fallu attendre jusqu'à la 11e minute avant que Julien Blouin inscrive le troisième but",
    "La France s'y intéresse, mais Henri IV est assassiné avant que le projet ne voit le jour.",
    
    # NO EXPLETIVE examples from corpus
    "avant qu'il en ait informé sa compagnie de téléphone",
    "avant qu'il eût fait beaucoup de chemin, l'orage éclata dans toute sa furie",
    "avant qu'une utilisation plus répandue de ces termes dans le contexte canadien soit recommandée",
    "avant que quiconque puisse suivre ses instructions",
    "Faut qu'on se dépêche avant que ça ferme",
    "Tu ferais mieux de partir avant qu'il arrive",
    "Il faut vérifier les paramètres avant que l'installation démarre",
    "avant que les guides révisés soient publiés",
    "Le disque dur doit subir trois étapes de traitement : format de bas niveau, partition et format de haut niveau avant que l'ordinateur puisse les utiliser pour stocker des données",
    "Il faut coûte que coûte vous poser, et faire des choix avant que la situation ne s'abîme réellement",
    "Avant qu'il rentre j'en profita",
    "Il se passe bien cinq jours avant qu'on les enterre",
    "Avant que Paul puisse trouver une raison de ne pas accepter l'offre d'Archer",
    "Il faut les stopper avant qu'un accident ne surviennent et tue des familles !",
    "On devrait y aller avant que quelqu'un nous voit",
    "Il ne restait plus qu'une minute avant que tout s'effondre",
    "Avant qu'elle n'ait eut le temps de passer la porte, Chace l'interpela",
    "Il faut partir avant que cela ne soit trop tard",
    "Avant que je me lance moi aussi dans une rétrospective des évènements",
    "Il faut qu'on soigne les plus gravement blessé et qu'on évacue les gens qui peuvent marcher ou courir, avant que tout ne tourne à la catastrophe"
]

print("COMPREHENSIVE CORPUS SOURCE DISTRIBUTION ANALYSIS")
print("=" * 60)

# Analyze each sentence
results = defaultdict(int)
total_sentences = len(extended_corpus)

print(f"\nAnalyzing {total_sentences} sentences from the corpus...")
print("\nSENTENCE-BY-SENTENCE ANALYSIS:")
print("-" * 60)

for i, sentence in enumerate(extended_corpus, 1):
    category = categorize_sentence(sentence)
    results[category] += 1
    print(f"{i:2d}. {category:20s} | {sentence[:50]}...")

print(f"\nSOURCE DISTRIBUTION RESULTS:")
print("-" * 60)

for category, count in sorted(results.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / total_sentences) * 100
    print(f"{category:20s}: {count:2d} sentences ({percentage:5.1f}%)")

print(f"\nTotal analyzed: {total_sentences} sentences")
print("\nRECOMMENDED SOURCE DISTRIBUTION FOR FRAMEWORK DOCUMENT:")
print("-" * 60)

# Group similar categories for cleaner presentation
grouped_results = defaultdict(int)
for category, count in results.items():
    if category in ['Technical']:
        grouped_results['Technical'] += count
    elif category in ['Literary']:
        grouped_results['Literary'] += count
    elif category in ['Journalistic', 'News/Media']:
        grouped_results['Journalistic'] += count
    elif category in ['Academic', 'Educational']:
        grouped_results['Academic'] += count
    elif category in ['Administrative/Legal']:
        grouped_results['Administrative/Legal'] += count
    elif category in ['Business/Commercial']:
        grouped_results['Business/Commercial'] += count
    elif category in ['Conversational/Social']:
        grouped_results['Conversational/Social'] += count
    elif category in ['Medical/Health']:
        grouped_results['Medical/Health'] += count
    else:
        grouped_results['Other/General'] += count

for category, count in sorted(grouped_results.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / total_sentences) * 100
    print(f"{category:20s}: {count:2d} sentences ({percentage:5.1f}%)")
