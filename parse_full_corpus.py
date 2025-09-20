#!/usr/bin/env python3
"""
Parse the full corpus data provided by the user
Extract all sentences and analyze source distribution
"""

import re
from collections import defaultdict

def categorize_sentence(sentence):
    """Categorize a sentence based on content and linguistic markers"""
    sentence_lower = sentence.lower()
    
    # Technical/System contexts
    if re.search(r'système|processus|installation|logiciel|software|serveur|données|fichier|ordinateur|redémarre|mises à jour|paramètres|configuration|version|application|programme|code|algorithme|protocole|méthode|technique|disque dur|format|stockage|sauvegarde|backup', sentence_lower):
        return 'Technical'
    
    # Journalistic/Sports contexts  
    if re.search(r'minute.*avant.*inscrive.*but|équipe|match|sport|selon|rapporte|déclare|annonce|autorités|gouvernement|ministre|bilan|pompiers|incendie|journal|presse|média|actualité|information|nouvelle|julien blouin|but|score|joueur|terrain', sentence_lower):
        return 'Journalistic'
    
    # Literary/Narrative contexts
    if re.search(r'personnages|aventuriers|héros|protagoniste|roman|récit|histoire|conte|il était une fois|il fallait|elle attendait|craignant|irréparable.*se produise|colons français|révolution|territoire.*habité|bien avant que.*débarquent|littéraire|poétique|narratif|moonwatch|speedmaster|légende|collection', sentence_lower):
        return 'Literary'
    
    # Academic/Research contexts
    if re.search(r'recherche|étude|analyse|université|utilisation.*répandue.*recommandée|contexte.*canadien|commission|rapport|évaluation|scientifique|académique|théorie|hypothèse|méthodologie|corpus|linguistique|doctoral|thèse|publication', sentence_lower):
        return 'Academic'
    
    # Administrative/Legal contexts
    if re.search(r'il convient|validation|approbation|contrat|signature|autorisation|conformément|selon.*loi|réglementation|conseil municipal|maire|délibération|procédure.*administrative|juridique|légal|officiel|administration|bureaucratie', sentence_lower):
        return 'Administrative/Legal'
    
    # Business/Commercial contexts
    if re.search(r'entreprise|société|client|marché|vente|achat|commande|livraison|budget|coût|prix|économie|projet.*arrêté|développement|commercial|business|industrie|production|cargolifter|applications possibles', sentence_lower):
        return 'Business/Commercial'
    
    # Medical/Health contexts
    if re.search(r'médecin|docteur|hôpital|patient|traitement|médicament|symptômes|maladie|infection|virus|santé|consultation|diagnostic|thérapie|médical|clinique|soins|soigner|guérir|affections|irréversibilité', sentence_lower):
        return 'Medical/Health'
    
    # Conversational/Social contexts
    if re.search(r'faut qu\'on|bon.*il faut|allez.*dépêche|tu.*mieux|on devrait|je pense qu\'on|ça ferme|ça commence|ça se passe|avant qu\'on|avant que tu|avant que je|super|cool|génial|sympa|conversation|discussion|chat|forum', sentence_lower):
        return 'Conversational/Social'
    
    # Educational contexts
    if re.search(r'école|élève|étudiant|professeur|cours|leçon|apprentissage|formation|éducation|enseignement|classe|université|collège|lycée', sentence_lower):
        return 'Educational'
    
    return 'Other/General'

# Read the corpus data from a file (I'll create this from your provided data)
print("FULL CORPUS SOURCE DISTRIBUTION ANALYSIS")
print("=" * 60)
print("Parsing corpus data...")

# For now, let me work with the data you provided in chunks
# I'll need to process this systematically

corpus_file = "/Users/pfarrar/main/corpus_data.txt"

# First, let me create the corpus data file from what you provided
print("Creating corpus data file...")
