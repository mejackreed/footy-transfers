import urllib as ul
import urllib2 as ul2
import re


baseUrl = 'http://www.soccerbase.com/tournaments/tournament.sd?comp_id='

for no in range(1, 1000):
	url = baseUrl + str(no)
	req = ul2.Request(url)
	HTMLContent = ul2.urlopen(req).read()
	if HTMLContent.find('table') == -1:
		# not a league, maybe a cup tournament or sth. else
		continue

	namePat1 = re.compile('<div class=\"seasonSelector\">[\s\S]*?<div>')