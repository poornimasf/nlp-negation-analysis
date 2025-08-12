#!/usr/bin/env python3
import re

# Read the original file
with open('LINGUISTIC_ANALYSIS_FRAMEWORK.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Unicode characters with LaTeX-friendly alternatives
replacements = {
    'κ': 'kappa',
    'Σ': 'Sum',
    '↓': ' (down arrow) ',
    '→': ' (right arrow) ',
    '–': '--',
    ''': "'",
    ''': "'",
    '"': '"',
    '"': '"',
    '✅': '[YES]',
    '❌': '[NO]',
    '🎯': '[TARGET]',
    '🔧': '[TOOL]',
    '📊': '[CHART]',
    '🚫': '[BLOCKED]',
    '🔍': '[SEARCH]',
    '💡': '[IDEA]',
    '📚': '[BOOK]',
    '🔄': '[CYCLE]',
    '🎓': '[ACADEMIC]',
    '📋': '[LIST]',
    '🚨': '[ALERT]',
    '🆕': '[NEW]',
    '📝': '[NOTE]',
    '🔗': '[LINK]',
    '⚡': '[FAST]',
    '🎨': '[ART]',
    '🌟': '[STAR]',
    '🏆': '[TROPHY]',
    '🔥': '[FIRE]',
    '💪': '[STRONG]',
    '🎉': '[CELEBRATION]',
    '🚀': '[ROCKET]',
    '💻': '[COMPUTER]',
    '📈': '[TRENDING_UP]',
    '📉': '[TRENDING_DOWN]',
    '⭐': '[STAR]',
    '🎪': '[CIRCUS]',
    '🎭': '[THEATER]',
    '🎬': '[MOVIE]',
    '🎮': '[GAME]',
    '🎲': '[DICE]',
    '🎸': '[GUITAR]',
    '🎹': '[PIANO]',
    '🎺': '[TRUMPET]',
    '🎻': '[VIOLIN]',
    '🥁': '[DRUMS]',
    '🎤': '[MICROPHONE]',
    '🎧': '[HEADPHONES]',
    '🎵': '[MUSIC_NOTE]',
    '🎶': '[MUSIC_NOTES]',
    '🎼': '[MUSICAL_SCORE]',
    '🎙️': '[MICROPHONE]',
    '📻': '[RADIO]',
    '📺': '[TV]',
    '📱': '[PHONE]',
    '💾': '[DISK]',
    '💿': '[CD]',
    '📀': '[DVD]',
    '🖥️': '[DESKTOP]',
    '🖨️': '[PRINTER]',
    '⌨️': '[KEYBOARD]',
    '🖱️': '[MOUSE]',
    '🖲️': '[TRACKBALL]',
    '💽': '[MINIDISC]',
    '💻': '[LAPTOP]',
    '📟': '[PAGER]',
    '☎️': '[PHONE]',
    '📞': '[PHONE_RECEIVER]',
    '📠': '[FAX]',
    '📡': '[SATELLITE]',
    '🔋': '[BATTERY]',
    '🔌': '[PLUG]',
    '💡': '[BULB]',
    '🔦': '[FLASHLIGHT]',
    '🕯️': '[CANDLE]',
    '🪔': '[LAMP]',
    '🔥': '[FIRE]',
    '💥': '[EXPLOSION]',
    '💫': '[DIZZY]',
    '💨': '[DASH]',
    '💢': '[ANGER]',
    '💬': '[SPEECH_BUBBLE]',
    '👁️‍🗨️': '[EYE_SPEECH_BUBBLE]',
    '🗨️': '[LEFT_SPEECH_BUBBLE]',
    '🗯️': '[RIGHT_ANGER_BUBBLE]',
    '💭': '[THOUGHT_BUBBLE]',
    '💤': '[ZZZ]'
}

# Apply replacements
for unicode_char, replacement in replacements.items():
    content = content.replace(unicode_char, replacement)

# Remove any remaining problematic Unicode characters by replacing with [UNICODE]
content = re.sub(r'[^\x00-\x7F]+', '[UNICODE]', content)

# Write the cleaned content
with open('LINGUISTIC_ANALYSIS_FRAMEWORK_clean.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned file created: LINGUISTIC_ANALYSIS_FRAMEWORK_clean.md")
