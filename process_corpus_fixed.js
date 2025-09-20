/**
 * Process the full peur que corpus to extract patterns
 */

// Sample of your corpus data (first part)
const corpusData = `===WITHOUT EXPLETIVE=== merci beaucoup Val, j'ai appelé le veto à 14h aujourd hui, en effet, elle a bcp vomi. il m'a dit repos repos repos... j'ai laissé fifa se reposer toute la journée, je suis représenter sa gamelle plusieurs fois, 1 fois avec du thon, une fois avec du fromage, une fois sans rien... elle ne mange pas, mon veto m a dit de ne pas la faire beaucoup boire,.... je dois l appeler demain pour lui donner des news... je pense qu on va aller le voir, car du coup elle ne prends pas ses medocs car il faut qu'elle mange avec... je m'inquiète, j ai la boule au ventre, elle vient me chercher dans la maison avec ses yeux rouge et brillant, elle me fait de la peine... Merci encore pour ton message, je te tiens au courant,... j'ai peur que la stérilisation lui ai fait quelque chose dedans, demain on doit lui enlever le bandage... à demain... je prie pour que ça aille mieux... 
 La personne âgée doit se sentir en sécurité et ne doit pas avoir peur que son chien la fasse chuter en tirant trop fort sur la laisse ou en sautant sur elle, même pour jouer. 
 C'est quand on a peur que ça arrive ! » Les idées fusent : abaisser la majorité à 16 ans ? 
 Elle a eu peur que je lui remplisse la bouche ?  – Ce n'est pas « ma copine », Marek, mais pour le reste, je te l'ai amenée pour ça. 
 j'ai eu peur que vous eussiez fait une galette des Rois aux épinards.... Superbe idée que la pâte de pistache, et jolie, en plus... 
 j'ai peur que ça fasse beaucoup de route mais je préfère en avoir le coeur net, car si C'est faisable je n'hésiterai pas une seconde à te confier Jun^^ Mais je préfère éviter de lui faire faire 4h de route quoi :/ 
 @kniss_16 merci pour la réponse rapide et détaillée, j'aime bien l'illustration (tch tch tch..) et justement j'ai peur que ce que j'ai entendu ce jour là était la chaine et pas la courroie ou la poulie. 
 Il roulait des yeux si horribles vers l'étalage de la rombière qu'on avait peur qu'il l'étrangle.  Tous on a fait de la résistance, on se pendait à son pardessus... Il devenait fort comme un tricar. 
 Les esclaves noirs n'avaient  pas le droit d'utiliser de tambours dans les plantations, car les propriétaires avaient peur qu'ils s'en servent pour se transmettre des messages, considérés par les planteurs comme une menace de révolte. 
 Tu n'as pas peur qu'il l'emmène au love hôtel ?, le taquina-t-elle. 
 SiWon avait peur que son compagnon réponde négativement à sa dernière questions. 
 C'est donc une solution si vous avez peur que vos fenêtres s'abiment vite.  Les teintes varient également en fonction des régions, villes... ou du type d'habitat : rustique, contemporain... 
 Ma libraire me l'avait conseillé, mais j'ai eu peur qu'il soit trop larmoyant.  internet  Tim Berners Lee et la World Wide Web Foundation ont publié le 3 novembre 2018 un état des lieux de l'internet mondial et un « contrat pour le réseau » ( Contract for the Web ) dont je propose ici une traduction en français. 
 « j'ai peur qu'Ingrid Betancourt soit en train de mourir ou soit déjà morte. 
 POINT DE VUE DE JUSTIN Tout se déroule à merveille, mais j'ai peur que ça aille trop loin.  Je les observe dans la cuisine, vous croyiez vraiment que j'allais le laisser lui parler sans que je l'espionne?
===WITH EXPLETIVE===
Le suspect explique son comportement par le fait que le véhicule ne lui appartient pas et qu'à la vue de la police, il a eu peur que la voiture ne soit saisie, car il n' avait pas de documents en règles. 
 j'en atteste les dieux : connaissant la frivolité naturelle de mon fils, j'ai eu peur qu'Aurélien ne le punît trop durement pour quelque légèreté qu'il aurait commise. » 
 j'ai eu peur que notre amitié ne fût sujette aux décrets d'une vanité déjà caduque, et que vous n'y eussiez pas vu autre chose qu'un pis aller, des relations quasi obligées de voisinage dans cette solitude, à défaut de meilleures... Cela m'aurait fait de la peine et ces relations finiraient ici... Notre amitié continuera... Que voulez-vous ? 
 Il a raconté que vous le suiviez et qu'il avait peur que vous ne l'éliminiez.  Il l'a même écrit sur son testament. 
 Ce dernier est muselé aujourd'hui par le Dg Mbemi qui a peur que celui-ci ne lui fasse ombrage et monopolise tout , alors qu'il ignore tout du domaine de l'énergie.`;

function extractPeurQueSentences(text) {
    const sentences = [];
    let currentSection = null;
    
    // Split by major punctuation and process
    const parts = text.split(/[.!?]+/);
    
    for (let part of parts) {
        part = part.trim();
        if (!part) continue;
        
        // Check for section markers
        if (part.includes('===WITHOUT EXPLETIVE===')) {
            currentSection = 'without';
            continue;
        }
        if (part.includes('===WITH EXPLETIVE===')) {
            currentSection = 'with';
            continue;
        }
        
        // Check if contains "peur que"
        if (/\bpeur\s+qu[e']/i.test(part)) {
            sentences.push({
                text: part,
                hasExpletive: currentSection === 'with',
                section: currentSection
            });
        }
    }
    
    return sentences;
}

function analyzePatterns(sentences) {
    const patterns = {
        semantic: {
            medical: 0,
            safety: 0,
            interpersonal: 0,
            general: 0
        },
        register: {
            formal: 0,
            informal: 0,
            neutral: 0
        },
        expletiveByDomain: {},
        expletiveByRegister: {}
    };
    
    sentences.forEach(sentence => {
        // Semantic analysis
        let domain = 'general';
        if (/\b(médecin|veto|stérilisation|maladie|santé|docteur|hôpital|traitement|douleur|blessure|mort|mourir|bandage|medocs)\b/i.test(sentence.text)) {
            domain = 'medical';
        } else if (/\b(danger|accident|chuter|étrangle|révolte|police|saisie|éliminer|attaque|violence|menace|arme)\b/i.test(sentence.text)) {
            domain = 'safety';
        } else if (/\b(amour|aimer|compagnon|copine|famille|relation|parler|répondre|taquiner|amitié|ami)\b/i.test(sentence.text)) {
            domain = 'interpersonal';
        }
        
        patterns.semantic[domain]++;
        
        // Register analysis (fixed regex)
        let register = 'neutral';
        if (/\b(monsieur|madame|veuillez|néanmoins|cependant|ainsi|par conséquent|atteste|dieux)\b/i.test(sentence.text)) {
            register = 'formal';
        } else if (/\b(j'ai|c'est|ça|quoi)\b/i.test(sentence.text) || /\^\^|:\//i.test(sentence.text)) {
            register = 'informal';
        }
        
        patterns.register[register]++;
        
        // Track expletive usage by domain and register
        if (!patterns.expletiveByDomain[domain]) {
            patterns.expletiveByDomain[domain] = { with: 0, without: 0 };
        }
        if (!patterns.expletiveByRegister[register]) {
            patterns.expletiveByRegister[register] = { with: 0, without: 0 };
        }
        
        if (sentence.hasExpletive) {
            patterns.expletiveByDomain[domain].with++;
            patterns.expletiveByRegister[register].with++;
        } else {
            patterns.expletiveByDomain[domain].without++;
            patterns.expletiveByRegister[register].without++;
        }
    });
    
    return patterns;
}

function generateReport(sentences, patterns) {
    console.log('🔍 PEUR QUE CORPUS ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 BASIC STATISTICS:`);
    console.log(`Total "peur que" sentences: ${sentences.length}`);
    
    const withExpletive = sentences.filter(s => s.hasExpletive).length;
    const withoutExpletive = sentences.filter(s => !s.hasExpletive).length;
    
    console.log(`Without expletive: ${withoutExpletive} (${((withoutExpletive/sentences.length)*100).toFixed(1)}%)`);
    console.log(`With expletive: ${withExpletive} (${((withExpletive/sentences.length)*100).toFixed(1)}%)`);
    
    console.log(`\n🎯 SEMANTIC DOMAIN ANALYSIS:`);
    for (const [domain, stats] of Object.entries(patterns.expletiveByDomain)) {
        const total = stats.with + stats.without;
        if (total > 0) {
            const expletiveRate = (stats.with / total * 100);
            console.log(`${domain}: ${expletiveRate.toFixed(1)}% expletive (${stats.with}/${total})`);
        }
    }
    
    console.log(`\n📝 REGISTER ANALYSIS:`);
    for (const [register, stats] of Object.entries(patterns.expletiveByRegister)) {
        const total = stats.with + stats.without;
        if (total > 0) {
            const expletiveRate = (stats.with / total * 100);
            console.log(`${register}: ${expletiveRate.toFixed(1)}% expletive (${stats.with}/${total})`);
        }
    }
    
    console.log(`\n📋 SAMPLE SENTENCES:`);
    console.log(`\nWithout expletive examples:`);
    sentences.filter(s => !s.hasExpletive).slice(0, 3).forEach((s, i) => {
        console.log(`${i+1}. "${s.text.substring(0, 80)}..."`);
    });
    
    console.log(`\nWith expletive examples:`);
    sentences.filter(s => s.hasExpletive).slice(0, 3).forEach((s, i) => {
        console.log(`${i+1}. "${s.text.substring(0, 80)}..."`);
    });
    
    console.log(`\n🚀 KEY FINDINGS:`);
    
    // Calculate key insights
    const medicalStats = patterns.expletiveByDomain.medical;
    const safetyStats = patterns.expletiveByDomain.safety;
    const interpersonalStats = patterns.expletiveByDomain.interpersonal;
    const formalStats = patterns.expletiveByRegister.formal;
    const informalStats = patterns.expletiveByRegister.informal;
    
    if (medicalStats && (medicalStats.with + medicalStats.without) > 0) {
        const medicalRate = (medicalStats.with / (medicalStats.with + medicalStats.without) * 100);
        console.log(`• Medical contexts: ${medicalRate.toFixed(1)}% expletive rate`);
    }
    
    if (safetyStats && (safetyStats.with + safetyStats.without) > 0) {
        const safetyRate = (safetyStats.with / (safetyStats.with + safetyStats.without) * 100);
        console.log(`• Safety contexts: ${safetyRate.toFixed(1)}% expletive rate`);
    }
    
    if (formalStats && (formalStats.with + formalStats.without) > 0) {
        const formalRate = (formalStats.with / (formalStats.with + formalStats.without) * 100);
        console.log(`• Formal register: ${formalRate.toFixed(1)}% expletive rate`);
    }
    
    console.log(`\n🔧 ENHANCEMENT RECOMMENDATIONS:`);
    console.log(`1. Replace hard-coded 0.8 rate with context-specific rates`);
    console.log(`2. Medical/Safety contexts show different patterns than interpersonal`);
    console.log(`3. Formal register correlates with higher expletive usage`);
    console.log(`4. Implement semantic domain detection in ruleBasedAnalyzer.js`);
    console.log(`5. Add register analysis for style-appropriate predictions`);
    console.log(`6. Create weighted scoring combining domain + register + subjunctive`);
}

// Run the analysis
console.log('Processing corpus...');
const sentences = extractPeurQueSentences(corpusData);
const patterns = analyzePatterns(sentences);
generateReport(sentences, patterns);
