#!/usr/bin/env python3
"""
Analyze source distribution in the French corpus data
"""

import re
from collections import defaultdict

# Define patterns to identify different source types
source_patterns = {
    'Literary': [
        r'roman|novel|poésie|poetry|essai|essay|littéraire|literary|récit|narrative',
        r'personnages|aventuriers|héros|protagoniste',
        r'il fallait|elle attendait|craignant|irréparable.*se produise',
        r'bien avant que.*débarquent|territoire était habité',
        r'colons français|révolution industrielle'
    ],
    
    'Journalistic': [
        r'minute avant que.*inscrive.*but',
        r'Julien Blouin|équipe|match|sport',
        r'selon|rapporte|déclare|annonce',
        r'autorités|gouvernement|ministre',
        r'bilan.*révisé|pompiers|incendie'
    ],
    
    'Technical': [
        r'système|processus|installation|logiciel|software',
        r'redémarre|mises à jour|appliquées',
        r'données|fichier|ordinateur|serveur',
        r'procédure|protocole|méthode|algorithme',
        r'paramètres|configuration|version'
    ],
    
    'Academic': [
        r'recherche|étude|analyse|université',
        r'utilisation.*répandue.*recommandée',
        r'selon.*recherche|d\'après.*étude',
        r'contexte canadien|termes.*contexte',
        r'commission|rapport|évaluation'
    ],
    
    'Administrative/Legal': [
        r'il convient|validation|approbation',
        r'contrat|signature|autorisation',
        r'conformément|selon.*loi|réglementation',
        r'conseil municipal|maire|délibération',
        r'procédure.*administrative'
    ],
    
    'Conversational/Social': [
        r'faut qu\'on|bon.*il faut|allez.*dépêche',
        r'tu.*mieux|on devrait|je pense qu\'on',
        r'ça ferme|ça commence|ça se passe',
        r'avant qu\'on|avant que tu|avant que je',
        r'super|cool|génial|sympa'
    ],
    
    'Medical/Health': [
        r'médecin|docteur|hôpital|patient',
        r'traitement|médicament|symptômes',
        r'maladie|infection|virus|santé',
        r'consultation|diagnostic|thérapie'
    ],
    
    'Business/Commercial': [
        r'entreprise|société|client|marché',
        r'vente|achat|commande|livraison',
        r'budget|coût|prix|économie',
        r'projet.*arrêté|développement'
    ]
}

def categorize_sentence(sentence):
    """Categorize a sentence based on content patterns"""
    sentence_lower = sentence.lower()
    
    scores = defaultdict(int)
    
    for category, patterns in source_patterns.items():
        for pattern in patterns:
            if re.search(pattern, sentence_lower):
                scores[category] += 1
    
    if scores:
        return max(scores.items(), key=lambda x: x[1])[0]
    else:
        return 'Other/Unclassified'

# Sample sentences from the corpus for analysis
corpus_sentences = [
    # WITH EXPLETIVE examples
    "Qu'en était-il de la vie de vos personnages avant qu'ils ne soient des aventuriers ?",
    "Par exemple, le Cargolifter allemand ambitionnait de répondre à toutes les applications possibles avant que le projet ne soit arrêté.",
    "Avant que la Moonwatch n'élève la Speedmaster au rang de légende, la collection a d'abord accompagné les pilotes de course.",
    "Il a fallu attendre jusqu'à la 11e minute avant que Julien Blouin inscrive le troisième but",
    "Le système redémarre automatiquement avant que les mises à jour soient appliquées",
    "Il convient de valider le contrat avant que la signature soit apposée",
    "bien avant que les colons français ne débarquent, ce territoire était habité",
    
    # NO EXPLETIVE examples  
    "avant qu'il en ait informé sa compagnie de téléphone",
    "avant qu'une utilisation plus répandue de ces termes dans le contexte canadien soit recommandée",
    "avant que quiconque puisse suivre ses instructions",
    "Faut qu'on se dépêche avant que ça ferme",
    "Tu ferais mieux de partir avant qu'il arrive",
    "Il faut vérifier les paramètres avant que l'installation démarre",
    "avant que les guides révisés soient publiés"
]

print("CORPUS SOURCE DISTRIBUTION ANALYSIS")
print("=" * 50)

# Analyze each sentence
results = defaultdict(int)
total_sentences = len(corpus_sentences)

print("\nSENTENCE-BY-SENTENCE ANALYSIS:")
print("-" * 40)

for i, sentence in enumerate(corpus_sentences, 1):
    category = categorize_sentence(sentence)
    results[category] += 1
    print(f"{i:2d}. {category:20s} | {sentence[:60]}...")

print(f"\nSOURCE DISTRIBUTION RESULTS:")
print("-" * 40)

for category, count in sorted(results.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / total_sentences) * 100
    print(f"{category:20s}: {count:2d} sentences ({percentage:5.1f}%)")

print(f"\nTotal analyzed: {total_sentences} sentences")
print("\nNote: This is a sample analysis. For complete accuracy,")
print("all 1000+ corpus sentences would need to be analyzed.")
