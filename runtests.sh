nyc mocha tests/*.unit.test.js  --timeout 10000
nodever=$(node --version)
if ! [[ $nodever =~ 'v6.' ]]; then
    wjsh=$(which jshint)
    echo $wjsh
    if [[ -z $wjsh ]]; then
        npm install -g jshint
    fi
    pushd codequality
    bash runquality.sh
    popd
fi
