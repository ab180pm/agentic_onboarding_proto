import React from 'react';

export function AirbridgeBackground() {
  return (
    <div className="fixed inset-0 overflow-auto bg-white">
      <div id="ab-page-container" style={{ isolation: 'isolate' }} className="ab-page-container">
        {/* Navigation Bar */}
        <nav
          className="sticky left-0 z-10 w-full max-w-screen flex items-center justify-between pr-10 pl-20 border-b border-gray-200 bg-white"
          id="gnb"
          style={{ top: 0, height: '46px' }}
        >
          <div className="flex items-center">
            <a
              className="mr-24 max-md:hidden"
              href="https://airbridge.io/ko"
              rel="noreferrer noopener"
              target="_blank"
            >
              <img
                alt="Airbridge"
                className="h-[18px]"
                src="https://static.airbridge.io/images/2023_airbridge_branding/2023_airbridge_logo.svg"
              />
            </a>
            <button className="gap-x-4 px-6 py-2 text-sm hover:bg-gray-50 rounded transition-colors" type="button">
              <span className="inline-flex items-center gap-2">
                <span className="material-icons text-gray-600" style={{ fontSize: '18px' }}>groups</span>
                <span className="leading-[1] max-md:hidden">조직</span>
                <span className="material-icons text-gray-600" style={{ fontSize: '16px' }}>expand_more</span>
              </span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-x-4">
            <button className="inline-flex items-center justify-center gap-4 border border-transparent rounded-md hover:bg-gray-50 transition-colors h-[32px] min-w-[32px] px-10 text-sm text-gray-900" type="button">
              <span className="material-icons text-gray-600" style={{ fontSize: '18px' }}>help</span>
              <span className="leading-[1] break-keep max-lg:hidden">지원</span>
            </button>

            <a
              href="https://help.airbridge.io/ko/guides/airbridge-update"
              rel="noopener noreferrer"
              target="_blank"
              className="inline-flex items-center justify-center gap-4 border border-transparent rounded-md hover:bg-gray-50 transition-colors h-[32px] min-w-[32px] px-10 text-sm text-gray-900"
            >
              <span className="material-icons text-gray-600" style={{ fontSize: '16px' }}>update</span>
              <span className="leading-[1] max-lg:hidden">업데이트</span>
            </a>

            <button className="inline-flex items-center justify-center gap-4 border border-transparent rounded-md hover:bg-gray-50 transition-colors h-[32px] min-w-[32px] px-10 text-sm text-gray-900" type="button">
              <span className="material-icons text-gray-600" style={{ fontSize: '18px' }}>language</span>
              <span className="break-keep max-lg:hidden">한국어</span>
            </button>

            <div className="h-[20px] min-w-[1px] bg-gray-300"></div>

            <button className="inline-flex items-center justify-center gap-4 border border-transparent rounded-md hover:bg-gray-50 transition-colors h-[32px] min-w-[32px] px-10 text-sm text-gray-900" type="button">
              <span className="material-icons text-gray-600" style={{ fontSize: '18px' }}>person</span>
              <span className="leading-[1] max-lg:hidden">seungheon.lee</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex flex-1 overflow-x-hidden overflow-y-auto" id="ab180-layout">
          <section className="w-full" id="Dashboard__Container">
            <div className="h-full overflow-x-auto px-8 pt-8 pb-8">
              {/* App List Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl">앱 목록</h2>
                  <a
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    href="/appadd"
                  >
                    <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
                    <span>새로운 앱 등록</span>
                  </a>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    placeholder="검색"
                    className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: '18px' }}>
                    search
                  </span>
                </div>
              </div>

              {/* App Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 border-b border-gray-100 bg-gray-50 text-sm text-gray-600">
                  <div>앱</div>
                  <div>조직</div>
                  <div>앱 역할</div>
                  <div className="text-center">즐겨찾기</div>
                </div>

                {/* App Row 1 */}
                <a href="/app/demokr" className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="flex items-center gap-3">
                    <img
                      alt="Airbridge"
                      src="https://static.airbridge.io/images/etc/demokr.svg"
                      className="w-10 h-10 rounded-lg"
                    />
                    <div>
                      <div className="text-sm">Airbridge</div>
                      <div className="text-xs text-gray-500">demokr</div>
                    </div>
                  </div>
                  <div className="text-sm">Airbridge</div>
                  <div className="text-sm">사내 마케터</div>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <span className="material-icons text-gray-300" style={{ fontSize: '20px' }}>star_outline</span>
                  </button>
                </a>

                {/* App Row 2 */}
                <a href="/app/ablog" className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="flex items-center gap-3">
                    <img
                      alt="AB180블로그"
                      src="https://play-lh.googleusercontent.com/2Cx1aw4XwPXZ1icxxeaetDLSqcPnwA8ra85W5O4p2648Uh3Ay_yK-L90EQB5EraE96k=w240-h480-rw"
                      className="w-10 h-10 rounded-lg"
                    />
                    <div>
                      <div className="text-sm">AB180블로그</div>
                      <div className="text-xs text-gray-500">ablog</div>
                    </div>
                  </div>
                  <div className="text-sm">AB180 (Internal)</div>
                  <div className="text-sm">사내 마케터</div>
                  <button type="button" className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <span className="material-icons text-gray-300" style={{ fontSize: '20px' }}>star_outline</span>
                  </button>
                </a>

                {/* Demo App Card */}
                <button className="w-full p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <img
                      alt="Airbridge Demo"
                      src="https://play-lh.googleusercontent.com/2Cx1aw4XwPXZ1icxxeaetDLSqcPnwA8ra85W5O4p2648Uh3Ay_yK-L90EQB5EraE96k"
                      className="w-16 h-16 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm mb-1">Airbridge Demo</h3>
                      <p className="text-xs text-gray-600">에어브릿지가 제공하는 다양한 리포트 및 기능들을 살펴보세요</p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <span>데모 앱 둘러보기</span>
                      <span className="material-icons" style={{ fontSize: '16px' }}>arrow_forward_ios</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="mb-4">
                    <canvas style={{ width: '100%', height: '120px' }}></canvas>
                  </div>
                  <h3 className="text-base mb-2">모든 앱의 성과를 한눈에 확인하세요</h3>
                  <a href="#" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                    <span>오버뷰 대시보드</span>
                    <span className="material-icons" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </a>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-base mb-2">에어브릿지의 최신 기능을 확인하세요</h3>
                  <a
                    href="https://help.airbridge.io/ko/guides/airbridge-update"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <span>모든 업데이트 보러가기</span>
                    <span className="material-icons" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Google Fonts for Material Icons */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
    </div>
  );
}
