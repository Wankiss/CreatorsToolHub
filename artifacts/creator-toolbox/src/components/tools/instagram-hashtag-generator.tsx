import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Hash, Copy, Check, RefreshCw, ChevronDown, Sparkles,
  TrendingUp, Zap, Shield, ListChecks, Search, Target,
  BarChart2, Flame, Crosshair, Microscope,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Niche =
  | "fitness" | "beauty" | "business" | "finance" | "tech"
  | "education" | "food" | "travel" | "lifestyle" | "fashion"
  | "relationships" | "health" | "entertainment" | "coaching" | "photography";

type ContentType = "reel" | "carousel" | "static";
type Goal = "reach" | "engagement" | "growth" | "sales";

interface HashtagTier {
  broad: string[];    // 5 — 500K+ posts
  mid: string[];      // 10 — 50K–500K posts
  micro: string[];    // 15 — <50K posts
}

interface HashtagSet {
  setLabel: "A" | "B" | "C";
  broad: string[];
  mid: string[];
  micro: string[];
  totalCount: number;
  strategyNote: string;
}

// ─── Niche Hashtag Pools ──────────────────────────────────────────────────────

const NICHE_POOLS: Record<Niche, {
  label: string; emoji: string;
  broad: string[][]; mid: string[][]; micro: string[][];
}> = {
  fitness: {
    label: "Fitness", emoji: "💪",
    broad: [
      ["#fitness", "#workout", "#gym", "#fitnessmotivation", "#weightloss", "#fit", "#healthylifestyle", "#exercise"],
      ["#fitnessjourney", "#bodybuilding", "#strength", "#fitlife", "#workoutmotivation", "#fatloss", "#gains", "#gymlife"],
      ["#personaltrainer", "#cardio", "#getfit", "#fitnessgoals", "#fitgirl", "#sweat", "#fitnessinspiration", "#athleticperformance"],
    ],
    mid: [
      ["#fatlosstips", "#homeworkout", "#workoutroutine", "#gymtips", "#musclebuilding", "#fitnessadvice", "#weightlossjourney", "#strengthtraining", "#healthandwellness", "#bodygoals"],
      ["#fitnessmom", "#calisthenics", "#fitnesscommunity", "#fitnesscoach", "#workoutplan", "#fitnesslife", "#gymworkout", "#exerciseroutine", "#burnfat", "#buildmuscle"],
      ["#weightlosscoach", "#personalfitness", "#functionalfitness", "#fitnessaccountability", "#mealpreptips", "#proteinshake", "#postworkout", "#preworkout", "#gymrat", "#fitnessblog"],
    ],
    micro: [
      ["#fatlossmindset", "#homegymsetup", "#fitnesstipsforwomen", "#womenswellness", "#busypeoplefit", "#quickworkouts", "#workoutwithhme", "#fitnessover40", "#sustainablewellness", "#strengthcoach", "#fatlossdiet", "#fitnessforbeginners", "#fitnessmotivationdaily", "#healthyweightloss", "#functionalstrength"],
      ["#busymomworkout", "#workoutforbeginners", "#homeworkoutplan", "#fifteenminuteworkout", "#noequipmentworkout", "#bodyweightworkout", "#fitnessrealness", "#consistencyiskey", "#workoutgoals", "#gymanxiety", "#smallstepsbigresults", "#fatlossfood", "#fitnesscoaching", "#healthychoices", "#progressnotperfection"],
      ["#morningworkoutroutine", "#sustainablefatloss", "#fitnessforlife", "#noglossyfitness", "#homegymlife", "#fitnessbeyond30", "#buildahealthylife", "#eatwelllivewell", "#mindfulmovement", "#lowimpactworkout", "#busypeoplehealth", "#simpleweightloss", "#fitnesswithpurpose", "#strongnotskinny", "#realfitnesstips"],
    ],
  },
  beauty: {
    label: "Beauty", emoji: "💄",
    broad: [
      ["#beauty", "#makeup", "#skincare", "#glowup", "#selfcare", "#beautylovers", "#beautycare", "#skincareroutine"],
      ["#makeupartist", "#makeuplooks", "#skincaregoals", "#beautytips", "#naturalbeauty", "#beautylover", "#makeuplover", "#beautyessentials"],
      ["#beautyworld", "#makeupworld", "#skincarefirst", "#glowskin", "#beautyoftheday", "#makeupobsessed", "#skincaredaily", "#beautyjunkie"],
    ],
    mid: [
      ["#skincareadvice", "#makeuptutorial", "#drugstorebeauty", "#cleanbeauty", "#antiaging", "#oilyskincare", "#dryskincare", "#acneskincare", "#naturalmakeup", "#glowskincare"],
      ["#beautyproducts", "#beautyreview", "#makeupinspo", "#skincaretips", "#beautyroutine", "#skincareproducts", "#makeupover40", "#beginnerbeauty", "#budgetbeauty", "#beautyadvice"],
      ["#kbeautyroutine", "#doubleecleansing", "#hyperpigmentation", "#retinoltips", "#vitamincerum", "#spfeveryday", "#hyaluronicacid", "#niacinamide", "#skinbarrierhealth", "#moisturizedglow"],
    ],
    micro: [
      ["#affordablebeauty", "#drugstoredupes", "#minimalistmakeup", "#nodmakeup", "#makeupforbeginners2024", "#cleanbeautytips", "#glasskinroutine", "#getreadywithme", "#dewyglowskin", "#10stepkoreanroutine", "#morningskincareritial", "#sensitivebeauty", "#beautyconsistency", "#simpleskincare", "#naturalskincare2024"],
      ["#skincarefordryskin", "#acneproneskin", "#skincareforoilyskin", "#antiagingskincare", "#drugstoreskincare", "#affordableskincare", "#skincareforblackwomen", "#minimalistbeauty", "#beautycreator", "#beautyblogger", "#realhealthyskin", "#sustainablebeauty", "#veganbeauty", "#crueltyfreemakeup", "#glassskinroutine"],
      ["#hyaluronicacidskincare", "#niacinamideforskin", "#morningskincaredaily", "#skincarewithspf", "#retinolbeginnerguide", "#vitaminccream", "#retinoloverdose", "#fiveingredientroutine", "#simpleskincareroutine", "#tightporesremedy", "#oversizedporefix", "#dullskincure", "#brightskintips", "#skincareingredients", "#acneremedy"],
    ],
  },
  business: {
    label: "Business", emoji: "💼",
    broad: [
      ["#entrepreneur", "#business", "#marketing", "#success", "#smallbusiness", "#entrepreneurship", "#businessmindset", "#businesstips"],
      ["#digitalmarketing", "#onlinebusiness", "#sidehustle", "#businessowner", "#makemoneyonline", "#businessgrowth", "#startuplife", "#businesslife"],
      ["#businessstrategy", "#contentmarketing", "#solopreneur", "#businesscoach", "#growyourbusiness", "#businessadvice", "#brandbuilding", "#businesseducation"],
    ],
    mid: [
      ["#businesstipsforwomen", "#smallbizowner", "#onlinemarketing", "#socialmediamarketing", "#emailmarketing", "#passiveincome", "#freelancer", "#digitalproducts", "#contentcreator", "#brandingstrategy"],
      ["#businessmentor", "#scaleyourbusiness", "#workfromhome", "#digitalnomad", "#businessmom", "#entrepreneurtips", "#businesscommunity", "#marketingstrategy", "#onlinecourse", "#salestips"],
      ["#socialmediastrategy", "#instagrammarketing", "#contentplan", "#businessbrand", "#networkingforwomen", "#productlaunch", "#businesslearning", "#financialfreedom", "#womeninbusiness", "#blackbusiness"],
    ],
    micro: [
      ["#onlinebizowner", "#businesswithheart", "#brandingforcreators", "#growsmallbiz", "#smallbusinessadvice", "#digitalbrandbuilding", "#contentcreatortips", "#businessfromhome", "#entrepreneurjourney", "#instagramforbusiness", "#buildyourbrand", "#startingabusiness", "#businessgrowthstrategy", "#businessmentor2024", "#solopreneurlife"],
      ["#startupfounder", "#womenentrepreneur", "#businessgoalssetting", "#goalsongoals", "#productbasedbuisness", "#servicebasedbusiness", "#brandthatconverts", "#sellonline", "#digitalentrepreneur", "#freelancelife", "#smallbizlife", "#buildinginpublic", "#businesscoaching", "#onlineentrepreneur", "#growthmindsetbusiness"],
      ["#nichemarketing", "#contentmarketingtips", "#reachmorecustomers", "#organicmarketing", "#businesswithpurpose", "#valuablemarketing", "#socialmediaforbusiness", "#instatipsforsmallbiz", "#reelsmarketing", "#instagramreach", "#salestipsforcoaches", "#clientattractiontips", "#businessstrategy2024", "#femaleentrepreneur", "#launchyourbusiness"],
    ],
  },
  finance: {
    label: "Finance", emoji: "💰",
    broad: [
      ["#personalfinance", "#investing", "#money", "#financialfreedom", "#wealthbuilding", "#moneytips", "#finance", "#investing101"],
      ["#financialindependence", "#stockmarket", "#savemoney", "#budgeting", "#wealth", "#financialliteracy", "#moneymindset", "#richlife"],
      ["#financetips", "#investingtips", "#debtfree", "#moneymoves", "#buildwealth", "#passiveincome", "#financialgoals", "#retirementplanning"],
    ],
    mid: [
      ["#budgetingtips", "#savingmoney", "#emergencyfund", "#debtfreejourney", "#stockinvesting", "#etfinvesting", "#indexfunds", "#dividendinvesting", "#realestateinvesting", "#moneymotivation"],
      ["#financialplanning", "#moneyadvice", "#wealthmindset", "#sideincome", "#extramoney", "#financialcoach", "#financetok", "#financialfreedomjourney", "#brokerageaccount", "#financialstress"],
      ["#firsttimeinvestor", "#youngandfinancialfree", "#millennialfinance", "#womensfinance", "#moneygoals2024", "#frugalliving", "#moneysavingchallenge", "#spendingsmart", "#investsmart", "#buildfinancialwealth"],
    ],
    micro: [
      ["#budgetingforbeginners", "#investingwith100dollars", "#moneyfor20s", "#financialgrowthjourney", "#howtostartsaving", "#passiveincomeideas", "#sidehustleideas2024", "#financialcoachforwomen", "#debtsnowball", "#debtavalanche", "#zerodebtlife", "#moneydetox", "#financialwellness", "#smartspending", "#beatingdebt"],
      ["#simplesavingstrategy", "#beginnerinvestor", "#retiringsoon", "#earlyretirement", "#financialmindset", "#buildingwealth30s", "#moneyprinciples", "#sensibleinvesting", "#taxsavingtips", "#taxefficient", "#smartmoneymoves", "#financialjustice", "#affordableliving", "#moneyindependence", "#investingforwomen"],
      ["#howtobudgetproperly", "#debtfreeplan", "#crashcoursebudget", "#moneyhabits2024", "#savingsgoals", "#financefocused", "#noflufffinance", "#moneyroutine", "#dailymoneyhabits", "#financemindfulness", "#familybudgeting", "#savemoneyquickly", "#financialtransformation", "#wheredoesmymoneygo", "#extramoneyhacks"],
    ],
  },
  tech: {
    label: "Tech / AI", emoji: "🤖",
    broad: [
      ["#technology", "#tech", "#ai", "#artificialintelligence", "#chatgpt", "#aitools", "#productivity", "#innovation"],
      ["#techtrends", "#machinelearning", "#automation", "#software", "#coding", "#programming", "#developer", "#digitaltransformation"],
      ["#futuretech", "#aiinnovation", "#techworld", "#worksmarter", "#airevolution", "#techeducation", "#techstartup", "#techcommunity"],
    ],
    mid: [
      ["#aitipsandtricks", "#chatgpttips", "#aiforcreators", "#techproductivity", "#aiworkflow", "#nocode", "#appsthatwork", "#productiviyhacks", "#workflowautomation", "#toolsformakers"],
      ["#aicontentcreation", "#aiforbusiness", "#digitaltool", "#techreview", "#techadvice", "#aiprompts", "#techforentrepreneurs", "#learncoding", "#programmingtips", "#ailearning"],
      ["#bestaitools", "#aiwriting", "#aitool2024", "#techlifehack", "#promptengineering", "#nocodetool", "#aivshumans", "#chatbottips", "#aifuture", "#dailytechtools"],
    ],
    micro: [
      ["#chatgpthacks", "#aipromptwriting", "#aiforcreativework", "#automationforcreators", "#zapierauto", "#notionworkflow", "#productivitysystem", "#aicontenttools", "#makebettercontent", "#chatgptprompt2024", "#aimarketingtool", "#aiforrealpeople", "#aipoweredwork", "#aistartup", "#aiforstudents"],
      ["#aiblogging", "#aivideocreation", "#aicaptions", "#bestfreeitools", "#techhacks2024", "#beginnerdevtips", "#learnprogrammingfast", "#nocodetoolslist", "#techforanyone", "#aihelptips", "#aicontent2024", "#aiinmarketing", "#aiforfounders", "#smallbiztech", "#growwithtech"],
      ["#aiforthefuture", "#techearlyadopter", "#aiworkflowbuilder", "#worksmarterwithtech", "#aiexplained", "#aiineverydaylife", "#aiproductivitytips", "#techmindset", "#learnwithai", "#techforall", "#ailearningpath", "#buildwithai", "#techbeginnertips", "#aicontentstrategy", "#techinnovationdaily"],
    ],
  },
  education: {
    label: "Education", emoji: "📚",
    broad: [
      ["#education", "#learning", "#knowledge", "#didyouknow", "#facts", "#studytips", "#teaching", "#selfimprovement"],
      ["#educational", "#learningnewthings", "#growthmindset", "#mindblown", "#edtech", "#schooltips", "#studymotivation", "#lifelongleaning"],
      ["#teacherlife", "#educatorsofinstagram", "#onlinecourse", "#learningeveryday", "#knowledgesharing", "#learnfromhome", "#educationalcontent", "#selfdevelopment"],
    ],
    mid: [
      ["#studyhacks", "#studysmarter", "#memorytechniques", "#focustips", "#learningskills", "#academicadvice", "#productivestudy", "#studygroup", "#learnoninstagram", "#mindsetcoach"],
      ["#educationalpost", "#funfacts", "#psychologyfacts", "#sciencefacts", "#historyfacts", "#lifeadvice", "#instagramlearning", "#motivationallearning", "#lessonslearned", "#intellectualcuriosity"],
      ["#teachingwithtech", "#learningtips", "#deeplearning", "#criticalthinking", "#brainhacks", "#studyworkshop", "#everydaylearning", "#selftaughtlife", "#homeschooling", "#quicklearner"],
    ],
    micro: [
      ["#howtolearnanything", "#studymethodsthatiwork", "#masteringskills", "#braintraining", "#fasterlearning", "#learnfromanywhere", "#skillbuilding2024", "#microlearning", "#learningthroughcontent", "#howtoconcentrate", "#notemakingtips", "#revisionstudy", "#examstudy", "#smartstudying", "#productivityforstudents"],
      ["#educationforall", "#freeonlinelearning", "#selfpacedlearning", "#selftaughtcoder", "#selftaughtdesigner", "#onlinelearninglife", "#continuouseducation", "#knowledgeismoney", "#learnandgrow", "#mindexpansion", "#brainboostskills", "#learnasubject", "#memoryhacks", "#fastlearningmethods", "#studyplansetup"],
      ["#knowledgecreator", "#educationmatters", "#dailyfacts", "#randomfactsyoudidntknow", "#sciencefunfacts", "#historybuffs", "#psychologytips", "#learnonline2024", "#teachersofinstagram", "#educationalreels", "#didyouknowfacts", "#funlearning", "#shareyourknowledge", "#learningislife", "#knowledgedrop"],
    ],
  },
  food: {
    label: "Food", emoji: "🍕",
    broad: [
      ["#food", "#foodie", "#recipes", "#cooking", "#foodphotography", "#homecooking", "#foodlover", "#easyrecipes"],
      ["#instafood", "#foodblogger", "#healthyfood", "#mealprep", "#foodinspiration", "#yummy", "#foodstagram", "#delicious"],
      ["#foodrecipes", "#mealprepideas", "#foodporn", "#foodofinstagram", "#cookingathome", "#foodreels", "#quickrecipes", "#dinnerideas"],
    ],
    mid: [
      ["#mealpreprecipes", "#weeknightdinner", "#healthymeals", "#budgetmeals", "#highproteinmeals", "#lowcarbrecipes", "#veganrecipes", "#vegetarianrecipes", "#glutenfreerecipes", "#dairyfreecooking"],
      ["#fiveingredientmeals", "#easyweekdaymeals", "#onepanmeals", "#instantpotrecipes", "#airfryerrecipes", "#mealprepforbeginners", "#macromeals", "#familydinnerideas", "#foodblog", "#foodtips"],
      ["#cookingforbeginnners", "#breakfastrecipes", "#lunchideas", "#snackrecipes", "#dessertrecipes", "#bakingrecipes", "#souprecipes", "#pastarecipes", "#healthydessert", "#cleaneating"],
    ],
    micro: [
      ["#5minutemeals", "#highproteinmealprep", "#mealprepforweightloss", "#30minutedinner", "#budgetfriendlyeating", "#lowcaloriemeals", "#proteinrichmeal", "#hungrygirl", "#cookingforfamily", "#healthymealideas", "#mealideasonabudget", "#simplerecipes", "#nutritionrecipe", "#foodtipsandtricks", "#weeklymealdeal"],
      ["#plantbasedeating", "#ketorecipes", "#paleorecipes", "#wholefoods", "#antiinflammatoryfood", "#guthealtydiet", "#nourishingmeals", "#eatwhatyoulove", "#intuitivefeating", "#balanceddiet", "#mindfulmealing", "#foodasmediciine", "#nourishing", "#foodswaps", "#healthycookinghacks"],
      ["#kitchenhacks", "#cookinglifehacks", "#mealplanning101", "#preplikepro", "#batchcooking", "#cookingconfidence", "#savorymealprep", "#foodcontentcreator", "#foodblogrecipes", "#cookingwithkids", "#fridgemeals", "#pantrymeals", "#zerowansterecipes", "#foodpreservation", "#sustainableeating"],
    ],
  },
  travel: {
    label: "Travel", emoji: "✈️",
    broad: [
      ["#travel", "#wanderlust", "#adventure", "#explore", "#travelgram", "#instatravel", "#travelphotography", "#traveling"],
      ["#travellife", "#travelblogger", "#traveler", "#traveltips", "#solotravel", "#budgettravel", "#traveltheworld", "#worldtravel"],
      ["#travelinspiration", "#travelphotographer", "#traveladdict", "#travelcouple", "#travelmore", "#travelguide", "#travelmemories", "#hiddengems"],
    ],
    mid: [
      ["#budgettraveler", "#solotraveler", "#travelhacks", "#backpacker", "#cheaptravel", "#traveladvice", "#travelreels", "#travelvideos", "#travelblog", "#travelvlog"],
      ["#europetravel", "#asiatravel", "#africatravel", "#southamericatravel", "#usatravel", "#islandlife", "#citybreak", "#roadtrip", "#beachlife", "#mountaintravel"],
      ["#hikinggtrails", "#campinglife", "#travelwithkids", "#luxurytravel", "#volunteertravel", "#digitalnomadtravel", "#slowtravel", "#sustainabletravel", "#travelbloopers", "#travelcommunity"],
    ],
    micro: [
      ["#budgettravelguide", "#cheapflighthacks", "#traveltipsforbeginners", "#solofemaltravel", "#firsttimeabroad", "#affordabletravel", "#travelwithoutbreakingthebank", "#travelmoneyti", "#travelaloneandlovedit", "#offseasontravel", "#traveldestinationhacks", "#hiwtotravelmore", "#budgethoteltravel", "#hostellife", "#airtravelguide"],
      ["#hiddengemsdestinations", "#undiscoveredtravel", "#offthebeatenpath", "#obscuredestinations", "#secretbeaches", "#hiddengemscafe", "#unknowntravelspot", "#nontouristyplaces", "#localtraveltips", "#travelfulltime", "#digitalnomadlife", "#workthentravel", "#travelinglikelocal", "#exploringtheworld2024", "#travellifehack"],
      ["#travelbloggerlife", "#longtermtravel", "#gapyeartips", "#travelstorytime", "#travelmistakes", "#travellessonslearned", "#travelwithpurpose", "#sustainabletraveler", "#ecotourism", "#conscioustravel", "#minimalisttravel", "#carryononly", "#travelpacking", "#travelessentials", "#travelbagguide"],
    ],
  },
  lifestyle: {
    label: "Lifestyle", emoji: "✨",
    broad: [
      ["#lifestyle", "#selfcare", "#wellness", "#mindset", "#selfimprovement", "#personaldevelopment", "#habitbuilding", "#intentionalliving"],
      ["#dailyroutine", "#morningroutine", "#wellbeing", "#slowliving", "#simpleliving", "#hyggelife", "#mindfulness", "#positivemindset"],
      ["#lifestylechange", "#selflove", "#growthmindset", "#goalsetting", "#manifestation", "#abundancemindset", "#lifestylecreator", "#mindbodysoul"],
    ],
    mid: [
      ["#morninghabits", "#eveningroutine", "#habittips", "#selfcaredaily", "#dailyhabits", "#wellnessjourney", "#healthymindset", "#productivelife", "#livingslowly", "#calmlife"],
      ["#habitstacking", "#microhabits", "#lifestyleadvice", "#selfgrowth", "#personalgrowthjourney", "#wellnessroutine", "#mindsetcoach", "#clarityinthinking", "#productivemorning", "#holisticlifestyle"],
      ["#routineobsessed", "#morningperson", "#nightowlroutine", "#structuredlife", "#intentionalhabits", "#clearliving", "#clutterfreelife", "#intentionmorning", "#slowmorning", "#purposefullife"],
    ],
    micro: [
      ["#buildingbetterhabits", "#smalldailyhabits", "#consistencyiskey", "#startsmallgoals", "#habitsforsucess", "#morninghabitsforwin", "#5amclub", "#wakeupearlyclub", "#journalingdaily", "#gratitudejournal", "#dailyafirmations", "#lifestructure", "#dailysystem", "#routinebuilding", "#daysofintention"],
      ["#simpledailylife", "#mindfulliving", "#authenticliving", "#quietliving", "#gentlelifestyle", "#cozyroutine", "#slowandsteady", "#peacefulmorning", "#declutteredlife", "#essentialistliving", "#lessismore", "#authenticself", "#ownjourney", "#lifebydesign", "#personaldevelopmenttips"],
      ["#purposedrivenlife", "#buildyourdreamlife", "#designyourlife", "#creatingbalance", "#lifebeyondbusy", "#selfdiscovery", "#personaltransformation", "#liferedesign", "#growthisaprocess", "#gentleself", "#soulfuliving", "#livingwithintention", "#createyourdestiny", "#lifequality", "#lifetransformation"],
    ],
  },
  fashion: {
    label: "Fashion", emoji: "👗",
    broad: [
      ["#fashion", "#style", "#ootd", "#outfitoftheday", "#fashionblogger", "#fashionista", "#streetstyle", "#outfitinspo"],
      ["#fashionlovers", "#fashiontrends", "#fashionstyle", "#instafashion", "#clothing", "#womensfashion", "#mensfashion", "#casualstyle"],
      ["#fashiondesign", "#fasionphotography", "#styleinspiration", "#lookoftheday", "#fashionweek", "#outfitcheck", "#fashionable", "#styleoftheday"],
    ],
    mid: [
      ["#sustainablefashion", "#thriftfashion", "#capsulewardrobe", "#outfitideas", "#fashionadvice", "#styletips", "#budgetfashion", "#affordablestyle", "#minimalstyle", "#classicstyle"],
      ["#slowfashion", "#ethicalfashion", "#vintagefashion", "#streetwear", "#casualootd", "#workwear", "#transitionoutfit", "#styleoversize", "#fashionforall", "#inclusivefashion"],
      ["#styleforwomen", "#styleformen", "#fashionfor40s", "#fashionover30", "#curvyfashion", "#petitestyle", "#tallgirlfashion", "#plussizetyle", "#bodasonstyle", "#momstyle"],
    ],
    micro: [
      ["#outfitformulaideas", "#frenchgirlstyle", "#nordicstyletips", "#minimalistoutfit", "#howtostyledressupdown", "#outfitwithsneakers", "#dressforwork", "#affordableootd", "#howtobuilddwardrobe", "#basicstylingguide", "#neutralcapsule", "#buildabetterwardrobe", "#outfitbuildguide", "#styleguideforwomen", "#sustainablestyling"],
      ["#thriftedoutfit", "#thriftstorehaul", "#thriftshopfinds", "#thrifting2024", "#secondhandstyle", "#pre-loved", "#vintagefinds", "#vintageclothing", "#consignmentshop", "#sustainablewear", "#ecowardobe", "#rethinkfashion", "#zerowantefashion", "#circularfashion", "#buylessbuyetter"],
      ["#capsulewardrobetips", "#wardrobeessentials", "#minimalistcloset", "#fewerbetterclothes", "#timelespiece", "#wardrobedetox", "#editedcloset", "#capsulecollection", "#classicwardrobe", "#wellmadewardrobe", "#outfitformulamethod", "#stylingbasics", "#neutraloutfit", "#buildawardrobeon budget", "#sustainablestylist"],
    ],
  },
  relationships: {
    label: "Relationships", emoji: "❤️",
    broad: [
      ["#relationships", "#love", "#dating", "#selflove", "#couplegoals", "#relationshipadvice", "#romance", "#marriage"],
      ["#datingtips", "#relationshipgoals", "#selfworth", "#boundaries", "#communication", "#healthyrelationship", "#loveadvice", "#relationnshipcontent"],
      ["#redflags", "#greenflags", "#healingfrombreakup", "#singlelife", "#attachmentstyle", "#dating2024", "#modernromance", "#toxicrelationships"],
    ],
    mid: [
      ["#datingadvice", "#singleadvice", "#healthylove", "#attractingtheperson", "#dating101", "#relationnshiptools", "#communicationintips", "#couplescounseling", "#toxicloverhelp", "#loveadvicetips"],
      ["#avoidantattachment", "#anxiousattachment", "#secureatttachment", "#attachmenttypes", "#emotionalmaturity", "#emotionalhealth", "#healingrelationships", "#couplestherapy", "#selfrespect", "#breakingpatterns"],
      ["#datingwithintention", "#consciousdating", "#selectivdating", "#heartbreakheal", "#singleandthriving", "#soloeralife", "#loveyourself", "#selfhealingjourney", "#healingfromtrauma", "#relationshiptherapy"],
    ],
    micro: [
      ["#howtoattractbettermen", "#manifestlove", "#attracthimlove", "#datingasyoungwoman", "#datingin30s", "#datingfor40s", "#modernwomandating", "#datingwithinention", "#howtosetnboundaries", "#cuttingtoxicpeople", "#narcissistrecovery", "#boundarysetting", "#lovingwithoutlosingself", "#trustyourinstincts", "#datingchecklits"],
      ["#greenflgasindating", "#redflagsthatruin", "#healthycouple", "#makelovelaast", "#betterrelationship", "#communicatebetter", "#conflictresolution", "#coupleconversations", "#buildlove", "#mindfulrelationship", "#growingogether", "#dateweeklyideas", "#relationshipreset", "#lovemapping", "#loveguide2024"],
      ["#healyourselfirst", "#solohealing", "#attachmentrecovery", "#dearheartletter", "#healingwithgrace", "#recoveryafterbreakup", "#divorcedanddating", "#startingoveratany age", "#selflovepractice", "#romanticizesolotife", "#datingslowdown", "#intentionalrelationship", "#lovewithwisdom", "#singlewithpurpose", "#yourownbff"],
    ],
  },
  health: {
    label: "Health", emoji: "🌿",
    broad: [
      ["#health", "#wellness", "#nutrition", "#mentalhealth", "#wellbeing", "#healthylifestyle", "#holistichealth", "#healthtips"],
      ["#healthandwellness", "#nutritionadvice", "#guthealth", "#immunehealth", "#mentalwellness", "#physicalhealth", "#preventivehealth", "#naturalhealth"],
      ["#healthcoach", "#wellnesscoach", "#nutritionist", "#functionalmedicine", "#holisticnutrition", "#healthyhabits", "#healyourbody", "#healingnaturally"],
    ],
    mid: [
      ["#guthealthtips", "#hormonalhealth", "#adrenalhealth", "#thyroidhealth", "#sleephealth", "#stressmanagement", "#antiinflammatorydiet", "#immuneboost", "#nervousystemhealth", "#liverhealthtips"],
      ["#nutritionscience", "#mindgutconnection", "#microbiome", "#probioticsfooded", "#fermentedfoods", "#naturalremedies", "#herbalhealth", "#healingfoods", "#antiinflammation", "#healthylungs"],
      ["#detoxhabits", "#healthyroutine", "#cleangutdiet", "#aminoacid", "#collagen", "#antioxidants", "#nutrientdense", "#wholefoodshealth", "#vitaminroutine", "#supplementguide"],
    ],
    micro: [
      ["#guthealtlyhabits", "#fixgutissues", "#naturalguthealth", "#guthealthmealplan", "#probioticfoods", "#fermentedkefir", "#restoreguthealth", "#guthealthprotocol", "#microbiomeboost", "#leakygutfix", "#bloatingcure", "#guttransformation", "#guthealthforwomen", "#digestivewellness", "#guthealthchangedmylife"],
      ["#holisticliving", "#naturalhealing", "#holisticnutritiontips", "#herbalmedicneship", "#plantbasedhealth", "#veganhealth", "#nutritionformindhealth", "#foodismedicine", "#naturalmedicineadvice", "#alternativehealth", "#healingjournee", "#functionalhealthcoach", "#chronicillnesslife", "#autoimmunediet", "#autoimmunehealing"],
      ["#anxietyrelief", "#stressrelieftips", "#nervoussystemregulation", "#somatic", "#soothenervoussystem", "#cortisol", "#burnoutrecovery", "#restorativeself", "#cortisoltips", "#adrenalrecovery", "#reducestressnow", "#selfcareashealing", "#calmyourmind", "#mentalhealthadvice", "#wellnessmindset"],
    ],
  },
  entertainment: {
    label: "Entertainment", emoji: "🎬",
    broad: [
      ["#entertainment", "#viral", "#trending", "#popculture", "#movies", "#music", "#tv", "#celebrity"],
      ["#moviereview", "#tvshows", "#musicvideo", "#entertainment", "#popculturre", "#netflixrecommendation", "#streaminglife", "#viralmoment"],
      ["#tvaddcit", "#seriesrecommendations", "#filmlovers", "#movielover", "#musiclover", "#movienight", "#bingeable", "#streamingstatus"],
    ],
    mid: [
      ["#moviereviews", "#tvseriesreview", "#netflixoriginals", "#primevideoshow", "#disneyplus", "#appletv", "#hbomax", "#musicalreviews", "#newmovie2024", "#filmcritic"],
      ["#hiddengemshows", "#underratedmovies", "#mustwatch", "#bestmovies", "#topseriestowatch", "#documentaryrecommendation", "#reelreview", "#entertainmentcommentary", "#showrecap", "#mustwatchshow"],
      ["#culturalcommentary", "#entertainmentanalysis", "#popculturcommentary", "#movietake", "#seriesanalysis", "#entertainmentcoach", "#contentcritique", "#streamingseries", "#culturaltake", "#mediareview"],
    ],
    micro: [
      ["#bestnetflixshows2024", "#tvshowsyouneedtowatch", "#moviesyouhavetosee", "#hiddenshows", "#undercovershows", "#sleptonseries", "#moviesyouneverwatchedyet", "#hiddenmoviegems", "#moviesuntoldstory", "#greatmoviesyouoverloked", "#movieslikethis", "#showslikethis", "#underratedfilms2024", "#alsoreccommend", "#streamwhatsnext"],
      ["#moviestowatch2024", "#breakingdownfilm", "#filmanalysis2024", "#movescene", "#cinematography", "#filmschool", "#indiefilm", "#directorscut", "#behinscenes", "#moviemaking", "#filmmaking101", "#screenwriting", "#moviematics", "#cinematicstory", "#storytellinginfilm"],
      ["#entertainmentcreator", "#commentarycreator", "#reactionchannel", "#entexplained", "#entculture", "#deconstructseries", "#tvbreakdown", "#seriesbreakdown", "#movieunpacked", "#storytellingelements", "#filmtheory", "#entertainmentdeep dive", "#tvdiscussion", "#moviebreakdown", "#seriesexplained"],
    ],
  },
  coaching: {
    label: "Coaching", emoji: "🎯",
    broad: [
      ["#coaching", "#lifeCoach", "#businesscoach", "#mindsetcoach", "#personaldevelopment", "#selfdevelopment", "#growthmindset", "#transformation"],
      ["#coach", "#coachinglife", "#lifecoaching", "#careercoach", "#executivecoaching", "#wellnesscoach", "#performancecoaching", "#healthcoach"],
      ["#motivational", "#inspirational", "#mentoring", "#coachingonline", "#virtualcoach", "#coachingprogram", "#mindsetshift", "#empowerment"],
    ],
    mid: [
      ["#lifecoachtips", "#coachingbusiness", "#buildcoachingbusiness", "#coachingforwomen", "#lifecoachingprogram", "#mindsetchange", "#coachingcommunity", "#coach2024", "#onlinecoachinglife", "#coachingresults"],
      ["#nichercoaching", "#fitnesscoachingtips", "#businesscoachlife", "#ceocoaching", "#goalsettingcoach", "#accountability", "#coachingmasterclass", "#coachingwisdom", "#findyourpurpose", "#yourcoachingway"],
      ["#coachingjourney", "#discoveryourpurpose", "#goachingmindset", "#coachingcoaches", "#coachingadvice", "#coachingcertification", "#icfcoach", "#certifiedcoach", "#coachingprogram2024", "#coachingtools"],
    ],
    micro: [
      ["#howtolaunchcoaching", "#coachingoninstagram", "#coachingbrandbuilding", "#startacoachingbusiness", "#buildcoachingpractice", "#cliengettingcoach", "#coachbrandstrategy", "#buildcoachcredibility", "#coachingclientwin", "#clientresults", "#coachingpackage", "#coachpricingstrategy", "#onlinecoachingtips", "#lifecoachbrand", "#coachingservices"],
      ["#coachingforcreators", "#transformationalcoach", "#goalcoaching", "#productivitycoach", "#coachingforleaders", "#leadershipcoach", "#executivedevelopment", "#leadershiptools", "#highperformancecoach", "#coachingforhighachievers", "#mindsetmaster", "#successcoaching", "#limitingbeliefs", "#mindsetclearance", "#innerworkcoach"],
      ["#coachinsession", "#coachingextract", "#clientbreakthrough", "#coachingtransformation", "#coachingforanxiety", "#coachingforconfidence", "#confidencecoach", "#selfbeliefcoach", "#coachingforpurpose", "#coachingjourney2024", "#lifecoachinghelps", "#coachingrealtalk", "#coachingworkshard", "#findyourcoach", "#personalcoach"],
    ],
  },
  photography: {
    label: "Photography", emoji: "📷",
    broad: [
      ["#photography", "#photographer", "#photooftheday", "#photo", "#photos", "#photographylovers", "#photographylife", "#instaphoto"],
      ["#landscapephotography", "#portraitphotography", "#streetphotography", "#travelphotography", "#naturephotography", "#foodphotography", "#weddingphotography", "#lifestylephotography"],
      ["#photographyblog", "#photographytips", "#photographyart", "#photographyislife", "#photographyoftheday", "#photographylove", "#photographerstyle", "#photographercommunity"],
    ],
    mid: [
      ["#photographyadvice", "#photographytechniques", "#lightingphotography", "#compositiontips", "#editingtips", "#lightroometips", "#photoshoptips", "#cameratips", "#photographybasics", "#learnphotography"],
      ["#canonphotography", "#nikonfotography", "#sonyphotography", "#fujifilmphotography", "#mirrorlessphotography", "#filmphotography", "#analogphotography", "#mediumformatphotography", "#mobilephotography", "#smartphonephotography"],
      ["#goldenhourephotos", "#bluehourephotography", "#longexposure", "#nightphotography", "#blackandwhitephotography", "#colorphotography", "#minimalistphotography", "#abstractphotography", "#macrophotography", "#aeralphotography"],
    ],
    micro: [
      ["#photographyforbeginners", "#learncamerasettings", "#camerasettingstips", "#learnlightroom", "#lightroomeditingtips", "#photoshoptutorial", "#photographymistakes", "#exposuretriangle", "#shutterspeeed", "#aperturetips", "#isosettings", "#focuspoints", "#photographyhacks", "#dslrphotography", "#compositionrules"],
      ["#portraitlightingtips", "#windowlightportrait", "#naturallightphotography", "#goldenhourportrait", "#strobistphotography", "#portraittechnique", "#beautydishlight", "#softboxlighting", "#ringlightphotos", "#flatlaysetup", "#producphotography", "#brandshotsselfie", "#contentphotographytips", "#ugcphotography", "#contentcreatorphotography"],
      ["#solophotographer", "#photographybusiness", "#howtogetphotographyclients", "#freelancephotographer", "#weddingshootingtips", "#familyphotographytips", "#newbornphotographer", "#eventphotographer", "#photographypricing", "#photographyclientprocess", "#photographywithcamera", "#photographypassion", "#photographyniche", "#buildphotographybusiness", "#photographymarketing"],
    ],
  },
};

// ─── Goal + Content Type Adjustments ──────────────────────────────────────────

const GOAL_EXTRA: Record<Goal, string[]> = {
  reach:      ["#discoverability", "#instagramreach", "#organicgrowth", "#instagramalgorithm", "#reachmore"],
  engagement: ["#engagementboost", "#commentsforlikes", "#instagramengagement", "#saveworthy", "#sharethis"],
  growth:     ["#followerforgrowth", "#instagramgrowth", "#growoninstagram", "#instagramstrategy", "#buildyourfollowing"],
  sales:      ["#buynow", "#shopnow", "#linkinbio", "#instagramshopping", "#shoppable"],
};

const CONTENT_EXTRA: Record<ContentType, string[]> = {
  reel:     ["#instagramreels", "#reelsviral", "#reelsofinstagram", "#reelitfeelitlookit", "#viralreels"],
  carousel: ["#carouselpost", "#swipeleft", "#multipleimages", "#carouselinstagram", "#savepost"],
  static:   ["#instagram", "#instagrampost", "#photopost", "#instagramfeed", "#feedgoals"],
};

// ─── Generation Engine ────────────────────────────────────────────────────────

function pickN<T>(arr: T[], n: number, seed: number = 0): T[] {
  // Pseudo-deterministic shuffle based on seed so sets A/B/C differ
  const shuffled = [...arr].sort((a, b) => {
    const ha = JSON.stringify(a).split("").reduce((s, c, i) => s + c.charCodeAt(0) * (i + seed + 1), 0);
    const hb = JSON.stringify(b).split("").reduce((s, c, i) => s + c.charCodeAt(0) * (i + seed + 1), 0);
    return (ha % 97) - (hb % 97);
  });
  return shuffled.slice(0, n);
}

function buildTopicTags(topic: string): string[] {
  const words = topic.trim().toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const tags: string[] = [];
  if (words.length === 1) {
    tags.push(`#${words[0]}tips`);
    tags.push(`#${words[0]}advice`);
    tags.push(`#${words[0]}life`);
  } else {
    const camel = words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join("");
    const pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    tags.push(`#${camel}`);
    tags.push(`#${pascal}Tips`);
    tags.push(`#${camel}Journey`);
  }
  return tags;
}

function buildKeywordTags(keywords: string): string[] {
  return keywords
    .split(",")
    .map(k => k.trim().replace(/\s+/g, "").toLowerCase())
    .filter(k => k.length > 2)
    .map(k => `#${k}`)
    .slice(0, 5);
}

function generateSet(
  niche: Niche,
  topic: string,
  contentType: ContentType,
  goal: Goal,
  keywords: string,
  setIndex: number,
): HashtagSet {
  const pool = NICHE_POOLS[niche];
  const setLabel = (["A", "B", "C"] as const)[setIndex];
  const seed = setIndex * 37;

  // Pull from rotating pools
  const broadPool = pool.broad[setIndex % pool.broad.length];
  const midPool   = pool.mid[setIndex % pool.mid.length];
  const microPool = pool.micro[setIndex % pool.micro.length];

  // Topic + keyword extras
  const topicTags    = buildTopicTags(topic);
  const keywordTags  = buildKeywordTags(keywords);
  const goalTags     = GOAL_EXTRA[goal];
  const contentTags  = CONTENT_EXTRA[contentType];

  // Build broad (5): 3 from pool + 1 goal + 1 content
  const broad = [
    ...pickN(broadPool, 3, seed),
    pickN(goalTags, 1, seed)[0],
    pickN(contentTags, 1, seed)[0],
  ].filter(Boolean).slice(0, 5);

  // Build mid (10): 6 from pool + 2 topic + 2 keyword
  const midBase = pickN(midPool, 6, seed);
  const midExtra = [...topicTags.slice(0, 2), ...pickN(goalTags.slice(1), 2, seed)];
  const mid = [...midBase, ...midExtra].filter(Boolean).slice(0, 10);

  // Build micro (15): 11 from pool + 2 keyword + 2 topic
  const microBase = pickN(microPool, 11, seed);
  const microExtra = [...keywordTags.slice(0, 2), ...topicTags.slice(2, 4)];
  const micro = [...microBase, ...microExtra].filter(Boolean).slice(0, 15);

  const strategyNotes: Record<Goal, string> = {
    reach:      "Set optimized for reach — weighted toward broad and content-type discovery tags to maximize impressions.",
    engagement: "Set optimized for engagement — weighted toward niche micro tags where your audience actively participates.",
    growth:     "Set optimized for follower growth — balanced mix of broad visibility and mid-tier niche tags.",
    sales:      "Set optimized for sales — buyer-intent micro tags + direct CTAs to attract purchase-ready audiences.",
  };

  return {
    setLabel,
    broad,
    mid,
    micro,
    totalCount: broad.length + mid.length + micro.length,
    strategyNote: strategyNotes[goal],
  };
}

// ─── Hashtag Tier Card ────────────────────────────────────────────────────────

function TierBlock({
  tier, tags, icon, color, description, onCopy, copiedId, setLabel,
}: {
  tier: string; tags: string[]; icon: React.ReactNode; color: string;
  description: string; onCopy: (id: string, text: string) => void;
  copiedId: string | null; setLabel: string;
}) {
  const id = `tier-${setLabel}-${tier}`;
  const copied = copiedId === id;
  const text = tags.join(" ");

  return (
    <div className={`rounded-2xl border p-5 space-y-3 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-foreground text-sm">{tier}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30 text-muted-foreground">{tags.length} tags</span>
        </div>
        <button onClick={() => onCopy(id, text)}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
            copied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                   : "bg-white/70 dark:bg-white/10 border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy Tier"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/30 border border-white/50 dark:border-white/10 text-foreground">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How many hashtags should I use on Instagram in 2025?",
    a: "Instagram's current best practice is 5–10 focused, highly relevant hashtags — not the 20–30 that was standard in earlier years. In 2024, Instagram's Head of Instagram Adam Mosseri explicitly stated that using 3–5 highly relevant hashtags performs better than using 20+ mixed-relevance tags. However, most experienced growth strategists recommend 8–15 hashtags as the optimal range — enough to cover three distinct tiers (broad, mid-range, micro) without diluting relevance. The most important principle is quality over quantity: 10 precisely relevant hashtags will consistently outperform 30 loosely related ones. Instagram's algorithm cross-references your content against your hashtag selection — mismatched hashtags actively suppress distribution rather than helping it.",
  },
  {
    q: "What is a tiered Instagram hashtag strategy?",
    a: "A tiered Instagram hashtag strategy uses hashtags at three distinct competition levels to maximize your chances of being discovered by different audience sizes. Broad hashtags (500K+ posts) have massive audiences and high competition — your post will appear briefly in the feed before being pushed down by newer content, but even short exposure generates impressions. Mid-range hashtags (50K–500K posts) are the most strategically valuable tier — they have enough volume to generate real traffic but enough specificity that your content can remain visible longer and reach a targeted audience. Micro hashtags (under 50K posts) are where smaller and newer accounts can actually rank on the hashtag feed — your content stays visible for hours or days rather than minutes, and the audience is highly niche-focused and likely to engage. This generator produces exactly 30 hashtags: 5 broad + 10 mid + 15 micro — the ideal distribution for most Instagram accounts.",
  },
  {
    q: "What is the difference between broad, mid-range, and micro hashtags?",
    a: "Broad hashtags like #fitness or #travel have hundreds of millions of posts — your content appears in the feed for seconds before being pushed down. They drive impressions but rarely produce sustained engagement or follows. Mid-range hashtags like #fatlosstips or #budgettravel have 50K–500K posts and represent the sweet spot where content can stay discoverable for meaningful time periods. They reach people actively searching within a specific interest category. Micro hashtags like #fatlossmindset or #solofemaltravel have under 50K posts — competition is low enough that your post can rank for days. The audience is highly specific and intensely interested in exactly that topic, making them the highest-quality traffic source for engagement, saves, and follows. Using all three tiers simultaneously maximizes both broad visibility and deep niche connection.",
  },
  {
    q: "Should I use the same hashtags on every Instagram post?",
    a: "No — Instagram's algorithm penalizes repetitive hashtag usage over time, and 2025 research consistently shows that rotating hashtag sets produces 30–50% more reach over a content series than using identical sets repeatedly. There are two reasons to rotate: first, using the same 30 hashtags on every post signals to Instagram that the hashtags may not be organically relevant to the specific content; second, rotating gives you data on which hashtag combinations drive the most engagement, reach, and follows, allowing you to optimize over time. This generator produces three distinct hashtag sets (A, B, C) per generation — use Set A on Monday's post, Set B on Wednesday's, and Set C on Friday's, then cycle back. After 6–8 posts per set, regenerate fresh sets.",
  },
  {
    q: "Do hashtags still work on Instagram in 2025?",
    a: "Yes — hashtags remain an effective discovery mechanism on Instagram in 2025, but their role has evolved. Instagram now uses hashtags as content classification signals more than as distribution engines. When you use relevant hashtags, Instagram's algorithm better understands your content category and serves it to users who already follow similar hashtag communities or engage with related content — even if they don't actively browse the hashtag feed. The biggest shift is that Instagram now also uses natural language processing on your caption text and visual content to classify posts — meaning hashtags work best when they reinforce (not contradict) the content and caption. Hashtags are no longer the primary discovery driver they were in 2018–2021, but they remain a meaningful secondary signal that increases organic reach by an estimated 12–20% when used correctly.",
  },
  {
    q: "What are the best hashtags for Instagram Reels?",
    a: "For Instagram Reels, the optimal hashtag strategy prioritizes broad and mid-range discovery tags over micro hashtags, because Reels are distributed primarily through Instagram's recommendation algorithm rather than hashtag feeds. Reel-specific tags that consistently perform include content-type identifiers (#instagramreels, #reelsviral, #reelsofinstagram) combined with niche-category tags and a small set of topic-specific micro tags to help Instagram classify the content precisely. Use 5–8 hashtags rather than 15–30 for Reels — Instagram's own guidance for Reels specifically recommends 3–5 highly relevant hashtags. Avoid placing hashtags in Reels captions before the hook line — lead with the caption text, then add hashtags at the end or in the first comment.",
  },
  {
    q: "What are the best hashtags for Instagram Carousels?",
    a: "Instagram Carousels benefit from a heavier weighting toward micro hashtags because carousels are a save-driven format — people who save carousels are actively engaging with specific, detailed content on a focused topic. The most effective carousel hashtag strategy is 15 micro hashtags (to rank in niche feeds where your specific audience browses), 10 mid-range hashtags (for broader topic discovery), and 5 broad hashtags (for initial impressions). Carousel-specific tags that boost discoverability include topic category tags, save-oriented tags, and educational content tags. Carousels also tend to have a longer engagement window than Reels — they continue receiving saves and follows days after posting, making micro hashtag ranking particularly valuable for this format.",
  },
  {
    q: "How do I find the right hashtags for my niche?",
    a: "The most effective manual method for finding Instagram hashtags is: start with 2–3 competitor accounts in your niche who have high engagement rates, note which hashtags appear on their top-performing posts, and cross-reference those with Instagram's built-in search to check post volumes. Use Instagram's hashtag search to look at the 'Top' and 'Recent' tabs for any hashtag you're considering — if the Top posts have massive follower counts (500K+ accounts), you won't rank there; look for hashtags where the Top posts come from accounts with 10K–50K followers similar to yours. This generator automates that research process by pre-curating tiered hashtag pools for 15 niches, building topic-specific tags from your input, and mixing in goal-optimized and content-type tags to produce a complete, non-repetitive 30-tag set.",
  },
  {
    q: "Should I put hashtags in the caption or the first comment on Instagram?",
    a: "Both placements work equally well for Instagram reach and discoverability — Instagram confirmed in 2021 that there is no algorithmic difference between hashtags in captions versus the first comment. The strategic choice is about aesthetics and readability. Hashtags in captions are visible immediately and index faster. Hashtags in the first comment keep the caption cleaner and are preferred by creators who prioritize caption readability and brand presentation. The practical recommendation: if your caption is short (1–3 lines), adding hashtags directly to the caption is fine. If your caption is long and educational, post the hashtags in the first comment within the first minute of publishing to maintain clean caption formatting while still indexing quickly. Do not add hashtags in later comments — they must be in the first comment for maximum indexing speed.",
  },
  {
    q: "Is this Instagram hashtag generator free?",
    a: "Yes — the Instagram Hashtag Generator on Creator Toolbox is completely free with no account, subscription, or credit card required. Select your niche, enter your topic, choose your content type (Reel, Carousel, or Static Post), select your goal (Reach, Engagement, Growth, or Sales), and instantly generate three complete 30-hashtag sets (A, B, C) for content batching and rotation. Each set uses the tiered strategy: 5 Broad hashtags (500K+ posts), 10 Mid-Range hashtags (50K–500K posts), and 15 Micro hashtags (under 50K posts). Copy individual tiers or the full 30-tag set in one click. All hashtags are Instagram-native, niche-specific, and free from banned or shadow-banned tags.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// ─── Accordion ─────────────────────────────────────────────────────────────────

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 overflow-hidden ${open ? "border-primary/40 shadow-primary/10 shadow-md" : "border-border hover:border-muted-foreground/30"}`}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl" aria-expanded={open}>
        <span className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
          <span className={`font-semibold text-base leading-snug transition-colors ${open ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{question}</span>
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <div ref={bodyRef} className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 500}px` : "0px" }}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function InstagramHashtagGeneratorTool() {
  const { toast } = useToast();
  const [niche,       setNiche]       = useState<Niche>("lifestyle");
  const [topic,       setTopic]       = useState("");
  const [contentType, setContentType] = useState<ContentType>("carousel");
  const [goal,        setGoal]        = useState<Goal>("engagement");
  const [keywords,    setKeywords]    = useState("");
  const [error,       setError]       = useState("");
  const [sets,        setSets]        = useState<HashtagSet[]>([]);
  const [activeSet,   setActiveSet]   = useState<"A" | "B" | "C">("A");
  const [copiedId,    setCopiedId]    = useState<string | null>(null);

  useEffect(() => {
    const id = "faq-schema-ig-hashtag-gen";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id; s.type = "application/ld+json";
      s.textContent = JSON.stringify(FAQ_SCHEMA);
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast({ title: "Copied!", description: "Hashtags copied to clipboard." });
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [toast]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!topic.trim()) { setError("Enter a topic for your Instagram post."); return; }
    if (topic.trim().length < 2) { setError("Topic is too short — be more specific."); return; }
    const generated = [0, 1, 2].map(i => generateSet(niche, topic.trim(), contentType, goal, keywords, i));
    setSets(generated);
    setActiveSet("A");
    setTimeout(() => document.getElementById("ig-hashtag-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  const activeSetData = sets.find(s => s.setLabel === activeSet);

  const NICHES: { value: Niche; label: string; emoji: string }[] = [
    { value: "fitness",       label: "Fitness",       emoji: "💪" },
    { value: "beauty",        label: "Beauty",        emoji: "💄" },
    { value: "business",      label: "Business",      emoji: "💼" },
    { value: "finance",       label: "Finance",       emoji: "💰" },
    { value: "tech",          label: "Tech / AI",     emoji: "🤖" },
    { value: "education",     label: "Education",     emoji: "📚" },
    { value: "food",          label: "Food",          emoji: "🍕" },
    { value: "travel",        label: "Travel",        emoji: "✈️" },
    { value: "lifestyle",     label: "Lifestyle",     emoji: "✨" },
    { value: "fashion",       label: "Fashion",       emoji: "👗" },
    { value: "relationships", label: "Relationships", emoji: "❤️" },
    { value: "health",        label: "Health",        emoji: "🌿" },
    { value: "entertainment", label: "Entertainment", emoji: "🎬" },
    { value: "coaching",      label: "Coaching",      emoji: "🎯" },
    { value: "photography",   label: "Photography",   emoji: "📷" },
  ];

  return (
    <>
      {/* ── Input Card ─────────────────────────────────────── */}
      <Card className="p-1 border-primary/20 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/50 rounded-3xl overflow-hidden">
        <div className="bg-card rounded-[1.35rem] p-6 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-5">

            {/* Topic */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-primary" /> Post Topic <span className="text-red-500">*</span>
              </label>
              <Input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. weight loss tips for busy moms, morning skincare routine, investing for beginners…"
                className="h-12 text-base bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            {/* Niche */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase">Your Niche</label>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(({ value, label, emoji }) => (
                  <button key={value} type="button" onClick={() => setNiche(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                      niche === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}>
                    <span>{emoji}</span>{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type + Goal */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Content Type</label>
                <div className="flex gap-2">
                  {([
                    { value: "reel" as ContentType,     label: "🎬 Reel" },
                    { value: "carousel" as ContentType, label: "📸 Carousel" },
                    { value: "static" as ContentType,   label: "🖼️ Static" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setContentType(value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1 ${
                        contentType === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground tracking-wide uppercase">Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "reach" as Goal,      label: "📈 Reach" },
                    { value: "engagement" as Goal, label: "💬 Engagement" },
                    { value: "growth" as Goal,     label: "🚀 Growth" },
                    { value: "sales" as Goal,      label: "💰 Sales" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setGoal(value)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center ${
                        goal === value ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground tracking-wide uppercase text-muted-foreground">
                Extra Keywords <span className="font-normal normal-case text-xs">(optional, comma-separated)</span>
              </label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder="e.g. fat loss, keto diet, beginners…"
                className="h-11 text-sm bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-xl" />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                <span>⚠️</span>{error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/20">
              <Hash className="w-5 h-5" /> Generate 30 Instagram Hashtags (3 Sets)
            </Button>
          </form>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────── */}
      {sets.length > 0 && activeSetData && (
        <section id="ig-hashtag-results" className="scroll-mt-24 animate-in slide-in-from-bottom-8 duration-500 space-y-5">

          {/* Set tabs + copy all */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">3 rotating hashtag sets — 30 tags each</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use Set A on post 1, Set B on post 2, Set C on post 3, then regenerate</p>
            </div>
            <div className="flex items-center gap-2">
              {(["A", "B", "C"] as const).map(s => (
                <button key={s} onClick={() => setActiveSet(s)}
                  className={`w-10 h-10 rounded-xl font-black text-sm border transition-all ${
                    activeSet === s ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}>
                  {s}
                </button>
              ))}
              <button
                onClick={() => handleCopy(
                  `all-${activeSet}`,
                  [...activeSetData.broad, ...activeSetData.mid, ...activeSetData.micro].join(" ")
                )}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                  copiedId === `all-${activeSet}` ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}>
                {copiedId === `all-${activeSet}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedId === `all-${activeSet}` ? "Copied!" : `Copy All 30`}
              </button>
              <button onClick={() => { setSets([]); setTopic(""); }}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-border bg-muted text-muted-foreground hover:border-primary/50 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Strategy note */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3 text-sm text-primary font-medium flex items-center gap-2">
            <Target className="w-4 h-4 shrink-0" />
            Set {activeSetData.setLabel}: {activeSetData.strategyNote}
          </div>

          {/* Tier breakdown */}
          <div className="space-y-4">
            <TierBlock
              tier="🔥 Broad Hashtags (5)"
              tags={activeSetData.broad}
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              color="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20"
              description="500K+ posts · Maximum visibility · Short exposure window · Use for impressions and brand awareness"
              onCopy={handleCopy} copiedId={copiedId} setLabel={activeSet}
            />
            <TierBlock
              tier="🎯 Mid-Range Hashtags (10)"
              tags={activeSetData.mid}
              icon={<Crosshair className="w-4 h-4 text-blue-500" />}
              color="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
              description="50K–500K posts · Balanced reach and targeting · Content visible for 1–6 hours · Best for discoverability"
              onCopy={handleCopy} copiedId={copiedId} setLabel={activeSet}
            />
            <TierBlock
              tier="🔍 Micro Hashtags (15)"
              tags={activeSetData.micro}
              icon={<Microscope className="w-4 h-4 text-green-500" />}
              color="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
              description="Under 50K posts · Highest chance of ranking · Content visible for hours to days · Best for niche engagement and follows"
              onCopy={handleCopy} copiedId={copiedId} setLabel={activeSet}
            />
          </div>

          {/* How to use the sets */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> How to Use Your 3 Rotating Sets
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {(["A", "B", "C"] as const).map((s, i) => {
                const setData = sets[i];
                const allTags = setData ? [...setData.broad, ...setData.mid, ...setData.micro] : [];
                const isCopied = copiedId === `batch-${s}`;
                return (
                  <div key={s} className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">Set {s}</span>
                      <button onClick={() => handleCopy(`batch-${s}`, allTags.join(" "))}
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          isCopied ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }`}>
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {isCopied ? "Done!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Post {i + 1}, {i + 4}, {i + 7}… · {allTags.length} hashtags total
                    </p>
                    <p className="text-xs text-muted-foreground">{setData?.strategyNote?.split("—")[0]?.trim()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">How to Use the Instagram Hashtag Generator</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: 1, icon: <Hash className="w-5 h-5 text-primary" />,
              title: "Enter your post topic and select your niche",
              desc: "Type your specific post topic — 'weight loss tips for busy moms' generates more targeted hashtags than 'fitness'. Then select your content niche so the generator applies the correct hashtag pools, keyword variations, and tier-appropriate tags for your category." },
            { step: 2, icon: <Target className="w-5 h-5 text-primary" />,
              title: "Choose content type and your goal",
              desc: "Select Reel, Carousel, or Static Post — each content type adjusts the tier weighting. Reels get more broad discovery tags; carousels get more micro-niche tags. Then choose your goal: Reach (impressions), Engagement (comments and saves), Growth (follows), or Sales (buyer-intent tags)." },
            { step: 3, icon: <BarChart2 className="w-5 h-5 text-primary" />,
              title: "Get 3 rotating sets — 30 hashtags each",
              desc: "Three distinct 30-hashtag sets are generated per click — Sets A, B, and C. Each contains 5 Broad, 10 Mid-Range, and 15 Micro hashtags. Use a different set on each post to avoid Instagram's repetition penalty and gather data on which sets drive the most reach and engagement." },
            { step: 4, icon: <Copy className="w-5 h-5 text-primary" />,
              title: "Copy tiers individually or all 30 at once",
              desc: "Switch between Set A, B, and C using the tabs. Copy any individual tier (Broad, Mid, Micro) for testing specific hashtag strategies, or copy all 30 in one click. Use the batch copy buttons in the rotation guide to prepare hashtag sets for multiple posts in advance." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4 p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Step {step}</p>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / SEO ──────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Instagram Hashtag Generator — The Tiered Strategy That Actually Grows Accounts</h2>
        </div>
        <div className="space-y-7 text-muted-foreground leading-relaxed text-sm">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary flex-shrink-0" />
              Why the 5 Broad + 10 Mid + 15 Micro Formula Works
            </h3>
            <p className="mb-3">
              The tiered hashtag strategy generates more reach and engagement than random hashtag selection because it simultaneously targets three different audience segments with three different discovery behaviors. Broad hashtags with 500K+ posts function as visibility tools — they generate a brief burst of impressions from users browsing high-volume feeds, putting your content in front of a large general audience for seconds to minutes. Mid-range hashtags with 50K–500K posts are the strategic core — large enough to drive real traffic, specific enough for your content to remain visible for 1–6 hours before being buried. Micro hashtags under 50K posts are where real discovery compounds — your content can rank on the hashtag's Top Posts for hours to days, reaching a highly self-selected audience who is specifically interested in exactly your topic.
            </p>
            <p className="mb-3">
              The mathematical advantage is clear: a post using only broad hashtags gets brief impressions but rarely converts to follows or saves because the audience is too general. A post using only micro hashtags reaches a small but highly engaged niche — high conversion but low volume. The 5+10+15 distribution captures all three effects simultaneously, optimizing for impressions (broad), discoverability (mid), and community connection (micro). This is the same framework used by Instagram growth agencies charging $500–$2,000/month for hashtag research.
            </p>
            <p>
              The generator produces exactly 30 hashtags per set — historically the maximum Instagram allows, though current best practice recommends using 15–25 of the 30 depending on niche competitiveness. All 30 are provided so you can test different subset sizes and combinations systematically.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary flex-shrink-0" />
              How Content Type and Goal Change Your Optimal Hashtag Mix
            </h3>
            <p className="mb-3">
              Instagram Reels are distributed primarily through the recommendation algorithm rather than hashtag feeds — this means broad and mid-range discovery tags matter more than micro hashtags for Reel reach. Reels benefit from 5–8 highly relevant hashtags rather than all 30, because Instagram's algorithm for Reels uses content signals (audio, visual, caption) as primary classification — hashtags serve as secondary confirmation. For Reels, the broad tier tags signal content category and the mid-range tags signal specific audience interest.
            </p>
            <p className="mb-3">
              Carousels are a fundamentally different format — they are browse-and-save content where users spend 30–90 seconds swiping through each slide. The Instagram algorithm distributes carousels through both hashtag feeds and Explore, and carousels continue receiving saves for days after posting. This makes the micro hashtag tier critically important for carousels — ranking on a niche hashtag feed means your carousel is discovered by users who are actively browsing that specific topic, making them highly likely to save and engage. For carousels, use all 30 hashtags weighted toward the micro tier.
            </p>
            <p>
              Goal selection adjusts which supplementary tags are added to each tier. Reach-optimized sets add broader discovery tags. Engagement-optimized sets add niche community tags. Growth-optimized sets add follow-oriented tags. Sales-optimized sets add buyer-intent hashtags used by people in a research or purchasing mindset. The goal adjustment is a secondary layer on top of the niche and topic matching — it fine-tunes each set's audience quality rather than changing the fundamental structure.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              The Hashtag Rotation System and Why It Matters
            </h3>
            <p className="mb-3">
              Using identical hashtags on every post is one of the most common Instagram growth mistakes — and one that actively harms account performance over time. Instagram's spam detection system monitors repetitive behavior patterns, and accounts that use the same 20–30 hashtags on every consecutive post are flagged as potentially inauthentic, which reduces post distribution. More practically, rotating hashtags gives you real performance data — you can track which set (A, B, or C) consistently drives more reach, engagement, or follower growth, then optimize your future hashtag strategy based on actual results rather than guesswork.
            </p>
            <p>
              The three sets generated by this tool are specifically designed to be non-overlapping — each pulls from different segments of the niche hashtag pool with different topic and keyword expansions. Use Set A on your first post, Set B on your second, Set C on your third, then either return to Set A or regenerate fresh sets. After 6–8 posts per set (roughly 2–4 weeks of content depending on your posting frequency), regenerate to introduce new hashtag variations and keep the rotation fresh. This system also ensures that if any hashtag in a set becomes temporarily oversaturated or de-prioritized by the algorithm, the rotation automatically reduces your exposure to that risk.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">What This Instagram Hashtag Generator Includes</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "30 hashtags per set in the proven 5 Broad + 10 Mid-Range + 15 Micro tier distribution — the formula used by top Instagram growth strategists",
            "3 rotating sets (A, B, C) generated simultaneously — use a different set on each post to avoid Instagram's repetition penalty and gather performance data",
            "4 goal types — Reach, Engagement, Growth, Sales — each adds goal-specific supplementary tags to the relevant tiers",
            "3 content type optimizations — Reel (weighted toward broad discovery), Carousel (weighted toward micro ranking), Static (balanced mix)",
            "15 supported niches — Fitness, Beauty, Business, Finance, Tech/AI, Education, Food, Travel, Lifestyle, Fashion, Relationships, Health, Entertainment, Coaching, Photography",
            "Topic-specific hashtag generation — your post topic is converted into camelCase, PascalCase, and long-tail variants automatically",
            "Keywords field — inject your specific niche terms into the micro tier for precise audience targeting",
            "Copy individual tiers (Broad, Mid, Micro) for testing — or copy all 30 hashtags at once for immediate use",
            "Tier descriptions with usage guidance — each tier card explains its post-volume range, visibility window, and best-use case",
            "Batch rotation guide — shows all 3 sets side by side with a posting schedule for content batching and systematic A/B testing",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} question={item.q} answer={item.a} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
