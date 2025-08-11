// Test sample sentences from the user's list
const testSentences = [
    // Expected Expletive (temporal urgency)
    "La prière est vraiment nécessaire afin qu'il y en ait davantage qui se tournent vers Dieu avant qu'il soit trop tard.",
    
    // Expected Expletive (preventive context)
    "Cela faisait déjà 5 bonnes minutes que nous occupions la chambre, il ne fallait pas trop attendre avant que notre couverture soit démasquée.",
    
    // Expected No Expletive (logical negation present)
    "Pas trop épais sinon le poids va la faire tomber avant qu'elle s'accroche ! Je reviendrai avec d'autres questions n'en doutez pas!",
    
    // Neutral/Ambiguous (simple temporal)
    "j'ouvrai le papier que Nick m'avait donné avant que je parte.",
    
    // Expected Expletive (urgency context)
    "Viens, viens tout de suite, avant qu'il soit trop tard.",
    
    // Factual/Administrative (could go either way)
    "Ces obligations ne seront plus pertinentes à la proclamation du Projet de loi 20, alors le directeur exécutif du RECA a levé l'exigence de suivre le cours du RECA préalable à la licence pour les évaluateurs avant qu'ils obtiennent leur licence."
];

console.log('🧪 Testing Sample Sentences');
console.log('===========================');

testSentences.forEach((sentence, i) => {
    console.log(`\n${i + 1}. "${sentence.substring(0, 80)}${sentence.length > 80 ? '...' : ''}"`);
    console.log('   Expected: [Will be filled by actual analysis]');
});

console.log('\n🎯 These sentences will be tested in the actual application to see:');
console.log('   - Classification (Expletive/No Expletive)');
console.log('   - Likelihood score (1-7)');
console.log('   - Reasoning with sentence boundary detection');
