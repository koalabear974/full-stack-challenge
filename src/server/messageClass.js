export function validateMessage(message) {
	var filter = [ 
		"Batask","Bologna","Beeotch","Bullspit","Burned","Booty","Bum","Bummer","Balderdash","Blangdang",
		"Blankety-","Blast/Blasted","Bleep/Bleepin","Bloomin","Blow","Bite","Brat","Cheese and Crackers",
		"Cheese and Rice","Cheeses","Cheesitz","Chit","Chafed","Chaps","Crud","Crabcakes","Crabby","Crapola",
		"Crappity","Crimeny","Dastardly","Dipstick","Doggone","Dump truck","Darn","Dag Gummit ","Dag Nabit",
		"Dang","Drat","Eff","Egad","Flippin","Fudge","Farging","Fiddle Sticks","Freak","Frack","Frazzle-rackin",
		"Friggin","Fricking","Fragdaggle","Flunkin","Gobbledygook","Goodness","Good Grief","Good Gravy",
		"Gosh","Garsh","God Bless America","Gul Durnit","Gobb Dash it","Gadzooks","Heck","H-E-double hockey sticks",
		"what the hay","Hogwash","Holy Cow","Holy Frijoles","Holy Shibblets","Horse Pucky","Holy Mother",
		"Hockey Puck ","Huffy","Hush","Jeez","Jiminy Crickits","Judas Priest","Kawabunga","Lint Licker","Malarkey",
		"Man/Oh Man","Monkey Flunker","Mother of Pearl","Mother Fathers ","Mothersmucker","Mother blanker",
		"My Word","Nuckin Futs","OMGsh","Piddle","Pluck it","Poop","Poopy ","Peeves","Rice cakes","Hopping",
		"Ram Rod","Rackafratz","Rassa-frazzin ","Shush","Snassa-frazzin","Sunny Beach","Snit","Snitch","Steaming",
		"Shiatsu","Sheesh","Shitaki mushrooms ","Swear to Christmas","Stuff yourself","Shoot","Snap","Shat",
		"Shut The Front Door","Son of a Mother Trucker","Sheesh","Shnikes","Shiznit","Shucks","Son of a Gun",
		"Son of a Mother","Son of a biscuit eater","Sufferin Succotash","Sucks","Stinks","Sunny Beach","Shamalama",
		"Ticked","Tater Sauce","Troll","Tool ","What-the","Weenie","Who-ha ","Wu-wu","Witch"
	]

	for (var i=0; i<filter.length; i++) {
        var pattern = new RegExp('\\b' + filter[i] + '\\b', 'gi');
        if(pattern.test(message)){
        	return false
        }
    }

    return true
}
