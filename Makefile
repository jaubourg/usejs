SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_ENGINE ?= `which node nodejs`
COMPILER = java -jar ${BUILD_DIR}/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js
POST_COMPILER = ${JS_ENGINE} ${BUILD_DIR}/post-compile.js

BASE_FILES = $(shell ${JS_ENGINE} ${BUILD_DIR}/get_modules.js ${BUILD_DIR}/data/modules.json ${SRC_DIR})

MODULES = ${BUILD_DIR}/data/intro.js\
	${BASE_FILES}\
	${BUILD_DIR}/data/outro.js

USE = ${DIST_DIR}/use.js
USE_MIN = ${DIST_DIR}/use.min.js

USE_VER = $(shell cat ${BUILD_DIR}/data/version.txt)
VER = sed "s/@VERSION/${USE_VER}/"

DATE=$(shell git log -1 --pretty=format:%ad)

all: update_submodules core

core: use min lint
	@@echo "usejs build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}
	
use: ${USE}

${USE}: ${MODULES} | ${DIST_DIR}
	@@echo "Building" ${USE}

	@@cat ${MODULES} | \
		sed 's/@DATE/'"${DATE}"'/' | \
		${VER} > ${USE};

lint: use
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Checking usejs against jslint..."; \
		${JS_ENGINE} build/jslint-check.js; \
	else \
		echo "You must have nodejs installed in order to test usejs against jslint."; \
	fi

min: use ${USE_MIN}

${USE_MIN}: ${USE}
	@@if test ! -z java; then \
		echo "Minifying usejs" ${USE_MIN}; \
		cat ${BUILD_DIR}/data/header.min.js | \
			sed 's/@DATE/'"${DATE}"'/' | \
			${VER} > ${USE_MIN}; \
		${COMPILER} ${USE} >> ${USE_MIN}; \
	else \
		echo "You must have nodejs installed in order to minify usejs."; \
	fi


clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

distclean: clean
	@@echo "Removing submodules"
	@@rm -rf test/qunit

# change pointers for submodules and update them to what is specified in jQuery
# --merge  doesn't work when doing an initial clone, thus test if we have non-existing
#  submodules, then do an real update
update_submodules:
	@@if [ -d .git ]; then \
		if git submodule status | grep -q -E '^-'; then \
			git submodule update --init --recursive; \
		else \
			git submodule update --init --recursive --merge; \
		fi; \
	fi;

# update the submodules to the latest at the most logical branch
pull_submodules:
	@@git submodule foreach "git pull \$$(git config remote.origin.url)"
	@@git submodule summary

pull: pull_submodules
	@@git pull ${REMOTE} ${BRANCH}

.PHONY: all jquery lint min clean distclean update_submodules pull_submodules pull core
