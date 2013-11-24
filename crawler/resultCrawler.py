import urllib as ul
import urllib2 as ul2
import re


baseUrl = 'http://www.soccerbase.com/tournaments/tournament.sd?tourn_id='

ResultRecord = []

tournID = [1159,939,1,2,105,106,107,109,108,110,111,112,113,1197,1026,41,42,389,390,391,392,393,394,395,396,397,1172,1007,45,46,321,322,323,324,325,326,327,328,329,1171,1017,39,40,311,319,312,313,314,315,316,317,318,1196,1027,44,43,441,442,443,444,445,446,447,448,449]
tournLen = len(tournID)
count = 0;
for no in tournID:#1000):

	print 'Completed: ', (count + 0.0) / tournLen
	count = count + 1
	print no

	url = baseUrl + str(no)
	req = ul2.Request(url)
	HTMLContent = ul2.urlopen(req).read()
	if HTMLContent.find('Latest table') == -1:
		# not a league, maybe a cup tournament or sth. else
		# does not include this season: 2013/2014
		continue

	namePat1 = re.compile('<div class=\"pageHeader pageHeaderTournaments\">[\s\S]*?</h1>')
	namePat2 = re.compile('<div class=\"seasonSelector\">[\s\S]*?</h3>')

	namePart1 = re.findall(namePat1, HTMLContent)
	namePart2 = re.findall(namePat2, HTMLContent)

	leagueName = namePart1[0].split('<h1>')[1].split('</h1>')[0]

	print leagueName
	# if leagueName not in ['Premier League', 'Italian Serie A', 'German Bundesliga 1', 'French Division 1', 'Spanish Primera Liga']:
	# 	continue

	leagueYear = namePart2[0].split('<h3>')[1].split('</h3>')[0]

	# abondon the results before 2000/01
	# if leagueYear[0] != '2':
	# 	continue

	leagueYearFrom = leagueYear.split('/')[0]
	# does not include this season
	# if leagueYearFrom == '2013':
	# 	continue
	leagueYearTo = leagueYear[:2] + leagueYear.split('/')[1]

	

	tablePat = re.compile('<table class="table">[\s\S]*?</table>')
	leagueTable = re.findall(tablePat, HTMLContent)[0]
	leagueTable = re.findall('<tbody>[\s\S]*?</tbody>', leagueTable)[0]
	tableEntryPat = re.compile('<tr[\s\S]*?</tr>')
	leagueTableEntries = re.findall(tableEntryPat, leagueTable)
	# print leagueTableEntries

	thisResultRecord = {}
	thisResultRecord['leagueName'] = leagueName
	thisResultRecord['year'] = leagueYearFrom + ' ' + leagueYearTo
	thisResultTableRecord = []

	for i in leagueTableEntries:
		thisResultTableTeamRecord = {}

		entryCells = re.findall('<td[\s\S]*?</td>', i)
		# print len(entryCells)
		if len(entryCells) != 15:
			print 'error ', no
			break
		tempRecord = [0] * 15
		for ind in range(15):
			if ind != 1:
				tempRecord[ind] = entryCells[ind].split('>')[1].split('<')[0].strip()
			else:
				tempRecord[ind] = entryCells[ind].split('team_id=')[1].split('" title')[0]
		# print tempRecord
		thisRank = tempRecord[0]
		thisClubId = tempRecord[1]
		thisWin = str(int(tempRecord[3]) + int(tempRecord[8]))
		thisDraw = str(int(tempRecord[4]) + int(tempRecord[9]))
		thisLose = str(int(tempRecord[5]) + int(tempRecord[10]))
		thisGoalF = str(int(tempRecord[6]) + int(tempRecord[11]))
		thisGoalA = str(int(tempRecord[7]) + int(tempRecord[12]))
		thisPoints = tempRecord[14]

		thisResultTableTeamRecord['clubId'] = thisClubId
		thisResultTableTeamRecord['rank'] = thisRank
		thisResultTableTeamRecord['win'] = thisWin
		thisResultTableTeamRecord['draw'] = thisDraw
		thisResultTableTeamRecord['lose'] = thisLose
		thisResultTableTeamRecord['goalsfor'] = thisGoalF
		thisResultTableTeamRecord['goalsagainst'] = thisGoalA
		thisResultTableTeamRecord['points'] = thisPoints

		thisResultTableRecord.append(thisResultTableTeamRecord)

	thisResultRecord['teamResult'] = thisResultTableRecord

	ResultRecord.append(thisResultRecord)

	# print leagueName
	# print leagueYearFrom + ' ' + leagueYearTo

f = open('./teamResult.json', 'w')
import json
jsonstring = json.JSONEncoder().encode(ResultRecord)
# print 
f.write(json.dumps(json.loads(jsonstring), indent = 4))
f.close()
