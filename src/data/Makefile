SHELL := /usr/bin/env sh
PG := /usr/bin/env psql
DB := ogalerie
DEBUG :=  # -e
SEEDS := seedOgalerie.pgsql # seeding.pgsql

all: database tables functions populate update

drop_database:
	sudo -u admin dropdb $(DEBUG) -U admin --if-exists $(DB)

drop_users: drop_database
	sudo -u admin dropuser $(DEBUG) -U admin --if-exists $(DB)_admin
	sudo -u admin dropuser $(DEBUG) -U admin --if-exists $(DB)_api

users: drop_users
	sudo -u admin createuser $(DEBUG) -U admin --no-login $(DB)_admin
	sudo -u admin createuser $(DEBUG) -U admin --login --pwprompt -g $(DB)_admin --no-inherit $(DB)_api

database: drop_database users
	sudo -u admin createdb $(DEBUG) -U admin -O $(DB)_admin $(DB)

tables: create_tables.pgsql
	$(PG) -W -U $(DB)_api -d $(DB) -f $<

functions:
	make -C functions

update:
	make -C update

populate: $(SEEDS)
	$(PG) -W -U $(DB)_api -d $(DB) -f $<

.PHONY: all drop_users drop_database users database tables functions populate update
